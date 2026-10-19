import { ApiError } from '../model/ApiError.js'

/**
 * What the customer can do on the shop page.
 */
export class ShopPage {
  #api
  #productList

  /**
   * Shows teas from the API in the product list.
   *
   * @param {import('../model/ApiClient.js').ApiClient} api - Fetches the teas.
   * @param {import('../view/ProductList.js').ProductList} productList - Shows them.
   */
  constructor(api, productList) {
    this.#api = api
    this.#productList = productList
  }

  /**
   * Fetches the teas and shows them, or a message if the API fails. Any other error is thrown again.
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
