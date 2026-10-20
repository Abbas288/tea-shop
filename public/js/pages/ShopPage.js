import { ApiError } from '../services/ApiError.js'
import { CartStorageError } from '../services/CartStorageError.js'
import { QuantityError } from '../model/QuantityError.js'

/**
 * What the customer can do on the shop page.
 */
export class ShopPage {
  #api
  #productList
  #cartStorage
  #cartToast
  /** @type {import('../model/Product.js').Product[]} The teas on the page. */
  #products = []

  /**
   * Shows teas from the API and puts the ones the customer picks in the cart.
   *
   * @param {import('../services/ApiClient.js').ApiClient} api - Fetches the teas.
   * @param {import('../components/tea-product-list/tea-product-list.js').TeaProductList} productList - Shows them.
   * @param {import('../services/CartStorage.js').CartStorage} cartStorage - Keeps the cart between pages.
   * @param {import('../components/tea-cart-toast/tea-cart-toast.js').TeaCartToast} cartToast - Says what happened to the cart.
   */
  constructor(api, productList, cartStorage, cartToast) {
    this.#api = api
    this.#productList = productList
    this.#cartStorage = cartStorage
    this.#cartToast = cartToast
  }

  /**
   * Fetches the teas and shows them, or a message if the API fails. Any other error is thrown again.
   */
  async show() {
    try {
      this.#products = await this.#api.getProducts()
      this.#productList.show(this.#products)
      this.#productList.onAddToCart((productName) => this.#addToCart(productName))
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error
      }

      this.#productList.showError('The teas could not be loaded. Please try again later.')
    }
  }

  /**
   * Reads the saved cart first, because another tab may have changed it.
   *
   * @param {string} productName - The tea the customer picked.
   */
  #addToCart(productName) {
    const product = this.#products.find((candidate) => candidate.name === productName)

    try {
      const cart = this.#cartStorage.load(this.#products)

      cart.add(product, 1)
      this.#cartStorage.save(cart)

      const bagsOfTea = cart.countBagsOf(product.name)

      this.#cartToast.show(`${product.name} in cart: ${bagsOfTea}`)
    } catch (error) {
      if (!(error instanceof QuantityError || error instanceof CartStorageError)) {
        throw error
      }

      this.#cartToast.show(`${product.name} was not added. ${error.message}`)
    }
  }
}
