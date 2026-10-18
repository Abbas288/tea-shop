import { ApiError } from './ApiError.js'

/**
 * What the customer can do on the shop page.
 */
export class ShopPage {
  #api
  #productList

  /**
   * Nothing is fetched until show is called.
   *
   * @param {import('./ApiClient.js').ApiClient} api - Fetches the teas.
   * @param {import('./ProductList.js').ProductList} productList - Shows them.
   */
  constructor(api, productList) {
    this.#api = api
    this.#productList = productList
  }

  /**
   * Fetches the teas and shows them. If the API fails, the page says so. Any other error is a bug, and is
   * thrown again and shows in the console.
   */
  async show() {
    try {
      const products = await this.#api.getProducts()

      this.#productList.show(products)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error
      }

      this.#productList.showError('The teas could not be loaded. Please try again later.')
    }
  }
}
