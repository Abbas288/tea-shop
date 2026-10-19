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
    const productDetails = await this.#getJson('/api/products')

    try {
      return productDetails.map((details) => new Product(details))
    } catch (error) {
      throw new ApiError('The server did not send a list of products.', { cause: error })
    }
  }

  /**
   * Any answer but 2xx counts as a failure, and so does an answer that is not JSON.
   *
   * @param {string} path - Such as "/api/products".
   * @returns {Promise<*>} The parsed answer.
   */
  async #getJson(path) {
    try {
      const response = await fetch(path)

      if (!response.ok) {
        throw new ApiError(`The server answered ${response.status} for ${path}.`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(`No usable answer from the server for ${path}.`, { cause: error })
    }
  }
}
