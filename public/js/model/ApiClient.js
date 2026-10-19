import { ApiError } from './ApiError.js'
import { Product } from './Product.js'

/**
 * Calls the shop's API. Every problem with the API becomes an ApiError.
 */
export class ApiClient {
  /**
   * In the order the shop shows them.
   *
   * @returns {Promise<Product[]>} Every tea.
   * @throws {ApiError} If the server cannot be reached, answers with an error, or sends something else.
   */
  async getProducts() {
    const productDetails = await this.#requestJson('api/products')

    try {
      return productDetails.map((details) => new Product(details))
    } catch (error) {
      throw new ApiError('The server did not send a list of products.', { cause: error })
    }
  }

  /**
   * The discount code the shop has for what the customer typed.
   *
   * @param {string} text - Such as "save10".
   * @returns {Promise<{ code: string, percent: number }>} The code in capitals and its percent.
   * @throws {ApiError} If the shop has no such code (status 404), or the server cannot answer.
   */
  async getDiscountCode(text) {
    const details = await this.#requestJson(`api/discount-codes/${encodeURIComponent(text.trim())}`)

    if (typeof details?.code !== 'string' || !Number.isInteger(details?.percent)) {
      throw new ApiError('The server did not send a discount code.')
    }

    return { code: details.code, percent: details.percent }
  }

  /**
   * Sends the order. The server prices it with its own prices and checks the discount code again.
   *
   * @param {{ name: string, email: string, street: string, postalCode: string, city: string }} customer - From the
   *   checkout form.
   * @param {import('./ShoppingCartWrapper.js').ShoppingCartWrapper} cart - The teas, and the discount code if any.
   * @returns {Promise<{ number: string, token: string }>} The order number, and the token for the tracking link.
   * @throws {ApiError} If the server refuses the order (status 400, with a message for the customer), or cannot
   *   answer.
   */
  async placeOrder(customer, cart) {
    const order = {
      customer,
      lines: cart.listLines().map((line) => ({ name: line.product.name, quantity: line.quantity })),
      discountCode: cart.discountCode,
    }
    const receipt = await this.#requestJson('api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })

    if (typeof receipt?.number !== 'string' || typeof receipt?.token !== 'string') {
      throw new ApiError('The server did not send an order number.')
    }

    return { number: receipt.number, token: receipt.token }
  }

  /**
   * Any answer but 2xx counts as a failure, and so does an answer that is not JSON. A failure keeps the server's
   * message if it sent one.
   *
   * @param {string} path - Such as "api/products".
   * @param {object} [options] - The method, headers and body, as fetch takes them.
   * @returns {Promise<*>} The parsed answer.
   */
  async #requestJson(path, options) {
    try {
      const response = await fetch(path, options)

      if (!response.ok) {
        throw new ApiError(await this.#errorMessageOf(response, path), { status: response.status })
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(`No usable answer from the server for ${path}.`, { cause: error })
    }
  }

  /**
   * The server sends JSON with a message for most errors.
   *
   * @param {Response} response - An answer that is not 2xx.
   * @param {string} path - The address that was asked for.
   * @returns {Promise<string>} The server's message, or one that names the status.
   */
  async #errorMessageOf(response, path) {
    try {
      const body = await response.json()

      if (typeof body?.message === 'string') {
        return body.message
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error
      }
    }

    return `The server answered ${response.status} for ${path}.`
  }
}
