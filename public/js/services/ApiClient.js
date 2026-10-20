import { ApiError } from './ApiError.js'
import { Product } from '../model/Product.js'

/**
 * @typedef {{ number: string, status: string, statusChangedAt: Date, completedSteps: string[],
 *   remainingSteps: string[] }} Tracking
 */

/**
 * @typedef {{ number: string, createdAt: Date, status: string, total: number }} OrderSummary
 */

/**
 * @typedef {{ number: string, createdAt: Date, status: string, statusChangedAt: Date,
 *   customer: { name: string, email: string, street: string, postalCode: string, city: string },
 *   lines: Array<{ name: string, price: number, quantity: number }>, subtotal: number, discountCode: string,
 *   discount: number, total: number, allowedEvents: string[] }} AdminOrder
 */

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

    return this.#toProducts(productDetails)
  }

  /**
   * The discount code the shop has for what the customer typed.
   *
   * @param {string} text - Such as "save10".
   * @returns {Promise<{ code: string, percent: number }>} The code in capitals and its percent.
   * @throws {ApiError} If the shop has no such code (status 404), or the server cannot answer.
   */
  async getDiscountCode(text) {
    const discountCodePath = `api/discount-codes/${encodeURIComponent(text.trim())}`
    const details = await this.#requestJson(discountCodePath)

    if (!this.#isDiscountCode(details)) {
      throw new ApiError('The server did not send a discount code.')
    }

    return { code: details.code, percent: details.percent }
  }

  /**
   * Sends the order. The server prices it with its own prices and checks the discount code again.
   *
   * @param {{ name: string, email: string, street: string, postalCode: string, city: string }} customer - From the
   *   checkout form.
   * @param {import('../model/ShoppingCartWrapper.js').ShoppingCartWrapper} cart - The teas, and the discount code if any.
   * @returns {Promise<{ number: string }>} The order number.
   * @throws {ApiError} If the server refuses the order (status 400, with a message for the customer), or cannot
   *   answer.
   */
  async placeOrder(customer, cart) {
    const receipt = await this.#postJson('api/orders', this.#toOrder(customer, cart))

    if (!this.#isReceipt(receipt)) {
      throw new ApiError('The server did not send an order number.')
    }

    return { number: receipt.number }
  }

  /**
   * Fetches where the order is. The email address goes in the body, never in the address.
   *
   * @param {string} number - Such as "K7Q2M9XD".
   * @param {string} email - The customer's email address.
   * @returns {Promise<Tracking>} The status, when it changed, and the steps done and left.
   * @throws {ApiError} Status 404 for an unknown number or another email address, or if the server cannot answer.
   */
  async getTracking(number, email) {
    const trackingPath = `api/orders/${encodeURIComponent(number.trim())}/tracking`
    const answer = await this.#postJson(trackingPath, { email })

    if (!this.#isTracking(answer)) {
      throw new ApiError('The server did not send where the order is.')
    }

    return this.#toTracking(answer)
  }

  /**
   * Logs the admin in. The browser keeps the session cookie the server sends.
   *
   * @param {string} email - The admin's email address.
   * @param {string} password - The admin's password.
   * @throws {ApiError} Status 401 for a wrong email address or password, or if the server cannot answer.
   */
  async logIn(email, password) {
    await this.#postJson('api/admin/login', { email, password })
  }

  /**
   * Ends the admin's session.
   *
   * @throws {ApiError} If the server cannot answer.
   */
  async logOut() {
    await this.#postJson('api/admin/logout', {})
  }

  /**
   * Lists every order for the admin, newest first.
   *
   * @returns {Promise<OrderSummary[]>} The orders, with the time as a Date.
   * @throws {ApiError} Status 401 if the admin is not logged in, or if the server cannot answer.
   */
  async getAdminOrders() {
    const answer = await this.#requestJson('api/admin/orders')

    if (!Array.isArray(answer) || !answer.every((order) => this.#isOrderSummary(order))) {
      throw new ApiError('The server did not send a list of orders.')
    }

    return answer.map((order) => this.#toOrderSummary(order))
  }

  /**
   * Fetches an order with the customer, the teas and the events it can take now.
   *
   * @param {string} number - Such as "K7Q2M9XD".
   * @returns {Promise<AdminOrder>} The order, with the times as Dates.
   * @throws {ApiError} Status 401 if the admin is not logged in, 404 for an unknown order, or if the server cannot
   *   answer.
   */
  async getAdminOrder(number) {
    const answer = await this.#requestJson(`api/admin/orders/${encodeURIComponent(number)}`)

    if (!this.#isAdminOrder(answer)) {
      throw new ApiError('The server did not send the order.')
    }

    return this.#toAdminOrder(answer)
  }

  /**
   * Changes the order's status with the event.
   *
   * @param {string} number - Such as "K7Q2M9XD".
   * @param {string} event - Such as "pack".
   * @returns {Promise<AdminOrder>} The changed order.
   * @throws {ApiError} Status 409 for an event the order cannot take now, 401 if the admin is not logged in, or if the
   *   server cannot answer.
   */
  async changeOrderStatus(number, event) {
    const answer = await this.#postJson(`api/admin/orders/${encodeURIComponent(number)}/events`, { event })

    if (!this.#isAdminOrder(answer)) {
      throw new ApiError('The server did not send the order.')
    }

    return this.#toAdminOrder(answer)
  }

  /**
   * Sends the body as JSON.
   *
   * @param {string} path - Such as "api/orders".
   * @param {object} body - What the server gets.
   * @returns {Promise<*>} The parsed answer.
   */
  #postJson(path, body) {
    return this.#requestJson(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  /**
   * Any answer but 2xx counts as a failure, and so does an answer that is not JSON. A failure keeps the server's
   * message if it sent one.
   *
   * @param {string} path - Such as "api/products".
   * @param {object} [options] - The method, headers and body, as fetch takes them.
   * @returns {Promise<*>} The parsed answer, or undefined for an answer without content (204).
   */
  async #requestJson(path, options) {
    try {
      const response = await fetch(path, options)

      if (!response.ok) {
        throw new ApiError(await this.#errorMessageOf(response, path), { status: response.status })
      }

      if (response.status === 204) {
        return undefined
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
    const body = await this.#jsonBodyOf(response)

    if (typeof body?.message === 'string') {
      return body.message
    }

    return `The server answered ${response.status} for ${path}.`
  }

  /**
   * An error page in HTML or plain text is not JSON.
   *
   * @param {Response} response - An answer that is not 2xx.
   * @returns {Promise<*>} The parsed body, or an empty object if it is not JSON.
   */
  async #jsonBodyOf(response) {
    try {
      return await response.json()
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error
      }

      return {}
    }
  }

  /**
   * A tea the Product class refuses makes the whole list unusable.
   *
   * @param {*} productDetails - The parsed answer.
   * @returns {Product[]} The teas.
   * @throws {ApiError} If the answer is not a list of teas.
   */
  #toProducts(productDetails) {
    try {
      return productDetails.map((details) => new Product(details))
    } catch (error) {
      throw new ApiError('The server did not send a list of products.', { cause: error })
    }
  }

  /**
   * The percent must be a whole number.
   *
   * @param {*} details - The parsed answer.
   * @returns {boolean} True for a code with its percent.
   */
  #isDiscountCode(details) {
    return typeof details?.code === 'string' && Number.isInteger(details?.percent)
  }

  /**
   * Names and quantities only. The server uses its own prices.
   *
   * @param {{ name: string, email: string, street: string, postalCode: string, city: string }} customer - From the
   *   checkout form.
   * @param {import('../model/ShoppingCartWrapper.js').ShoppingCartWrapper} cart - The teas, and the discount code if any.
   * @returns {{ customer: object, lines: Array<{ name: string, quantity: number }>, discountCode: string }} What the
   *   server gets.
   */
  #toOrder(customer, cart) {
    const lines = cart.listLines().map((line) => ({ name: line.product.name, quantity: line.quantity }))

    return { customer, lines, discountCode: cart.discountCode }
  }

  /**
   * Only the order number is needed.
   *
   * @param {*} receipt - The parsed answer.
   * @returns {boolean} True if it has an order number.
   */
  #isReceipt(receipt) {
    return typeof receipt?.number === 'string'
  }

  /**
   * Checks each field the tracking page shows.
   *
   * @param {*} answer - The parsed answer.
   * @returns {boolean} True if every field has the right type.
   */
  #isTracking(answer) {
    return (
      typeof answer?.number === 'string' &&
      typeof answer?.status === 'string' &&
      this.#isDate(answer?.statusChangedAt) &&
      this.#isListOfText(answer?.completedSteps) &&
      this.#isListOfText(answer?.remainingSteps)
    )
  }

  /**
   * JSON sends a date as text, such as "2026-10-20T10:00:00.000Z".
   *
   * @param {*} value - Part of an answer.
   * @returns {boolean} True if Date can read it.
   */
  #isDate(value) {
    return !Number.isNaN(new Date(value).getTime())
  }

  /**
   * Also true for an empty array.
   *
   * @param {*} value - Part of an answer.
   * @returns {boolean} True for an array of strings.
   */
  #isListOfText(value) {
    return Array.isArray(value) && value.every((item) => typeof item === 'string')
  }

  /**
   * Leaves out fields the page does not show, and copies the steps.
   *
   * @param {*} answer - An answer #isTracking accepts.
   * @returns {Tracking} The tracking, with the time as a Date.
   */
  #toTracking(answer) {
    return {
      number: answer.number,
      status: answer.status,
      statusChangedAt: new Date(answer.statusChangedAt),
      completedSteps: [...answer.completedSteps],
      remainingSteps: [...answer.remainingSteps],
    }
  }

  /**
   * Checks each field of a row in the admin's list.
   *
   * @param {*} order - Part of the parsed answer.
   * @returns {boolean} True if every field has the right type.
   */
  #isOrderSummary(order) {
    return (
      typeof order?.number === 'string' &&
      this.#isDate(order?.createdAt) &&
      typeof order?.status === 'string' &&
      Number.isInteger(order?.total)
    )
  }

  /**
   * Leaves out fields the list does not show.
   *
   * @param {*} order - A row #isOrderSummary accepts.
   * @returns {OrderSummary} The row, with the time as a Date.
   */
  #toOrderSummary(order) {
    return { number: order.number, createdAt: new Date(order.createdAt), status: order.status, total: order.total }
  }

  /**
   * Checks each field the admin's order view shows.
   *
   * @param {*} answer - The parsed answer.
   * @returns {boolean} True if every field has the right type.
   */
  #isAdminOrder(answer) {
    return (
      this.#isOrderSummary(answer) &&
      this.#isDate(answer?.statusChangedAt) &&
      this.#isCustomer(answer?.customer) &&
      Array.isArray(answer?.lines) &&
      answer.lines.every((line) => this.#isOrderLine(line)) &&
      [answer?.subtotal, answer?.discount].every(Number.isInteger) &&
      typeof answer?.discountCode === 'string' &&
      this.#isListOfText(answer?.allowedEvents)
    )
  }

  /**
   * Every field is text.
   *
   * @param {*} customer - Part of an answer.
   * @returns {boolean} True for a name, an email address, a street, a postal code and a city.
   */
  #isCustomer(customer) {
    return ['name', 'email', 'street', 'postalCode', 'city'].every((field) => typeof customer?.[field] === 'string')
  }

  /**
   * A tea with its price and number of bags.
   *
   * @param {*} line - Part of an answer.
   * @returns {boolean} True if every field has the right type.
   */
  #isOrderLine(line) {
    return typeof line?.name === 'string' && Number.isInteger(line?.price) && Number.isInteger(line?.quantity)
  }

  /**
   * Copies the customer, the lines and the events.
   *
   * @param {*} answer - An answer #isAdminOrder accepts.
   * @returns {AdminOrder} The order, with the times as Dates.
   */
  #toAdminOrder(answer) {
    const { name, email, street, postalCode, city } = answer.customer

    return {
      ...this.#toOrderSummary(answer),
      statusChangedAt: new Date(answer.statusChangedAt),
      customer: { name, email, street, postalCode, city },
      lines: answer.lines.map((line) => ({ name: line.name, price: line.price, quantity: line.quantity })),
      subtotal: answer.subtotal,
      discountCode: answer.discountCode,
      discount: answer.discount,
      allowedEvents: [...answer.allowedEvents],
    }
  }
}
