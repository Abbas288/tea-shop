import { ApiError } from '../model/ApiError.js'
import { CartStorageError } from '../model/CartStorageError.js'
import { QuantityError } from '../model/QuantityError.js'

/**
 * What the customer can do on the cart page.
 */
export class CartPage {
  #api
  #cartStorage
  #cartView
  /** @type {import('../model/Product.js').Product[]} The teas the shop sells. */
  #products = []

  /**
   * Shows the saved cart and lets the customer change it.
   *
   * @param {import('../model/ApiClient.js').ApiClient} api - Fetches the teas and their prices.
   * @param {import('../model/CartStorage.js').CartStorage} cartStorage - Keeps the cart between pages.
   * @param {import('../view/CartView.js').CartView} cartView - Shows the cart.
   */
  constructor(api, cartStorage, cartView) {
    this.#api = api
    this.#cartStorage = cartStorage
    this.#cartView = cartView
  }

  /**
   * Fetches the teas and shows the cart, or a message if the API fails. Any other error is thrown again.
   */
  async show() {
    try {
      this.#products = await this.#api.getProducts()
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error
      }

      this.#cartView.showMessage('The cart could not be loaded. Please try again later.')

      return
    }

    this.#cartView.onChangeQuantity((productName, quantity) => this.#changeQuantity(productName, quantity))
    this.#cartView.onRemove((productName) => this.#remove(productName))
    this.#update()
  }

  /**
   * A tea that another tab removed is left alone.
   *
   * @param {string} productName - The tea.
   * @param {number} quantity - The new number of bags.
   */
  #changeQuantity(productName, quantity) {
    this.#update((cart) => {
      if (cart.has(productName)) {
        cart.changeQuantity(productName, quantity)
      }
    })
  }

  /**
   * A tea that another tab removed is left alone.
   *
   * @param {string} productName - The tea.
   */
  #remove(productName) {
    this.#update((cart) => {
      if (cart.has(productName)) {
        cart.remove(productName)
      }
    })
  }

  /**
   * Reads the saved cart first, because another tab may have changed it. Then changes, saves and shows it. Without
   * a change it only shows the cart, and a change that could not be saved is not shown.
   *
   * @param {(cart: import('../model/ShoppingCartWrapper.js').ShoppingCartWrapper) => void} [change] - What to do.
   */
  #update(change) {
    let cart

    try {
      cart = this.#cartStorage.load(this.#products)

      if (change !== undefined) {
        change(cart)
        this.#cartStorage.save(cart)
      }

      this.#cartView.show(cart)
    } catch (error) {
      if (!(error instanceof QuantityError || error instanceof CartStorageError)) {
        throw error
      }

      if (error instanceof QuantityError) {
        this.#cartView.show(cart)
      }

      this.#cartView.showMessage(error.message)
    }
  }
}
