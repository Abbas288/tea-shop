import { ApiError } from '../services/ApiError.js'
import { CartStorageError } from '../services/CartStorageError.js'

/**
 * The checkout page. The server places the order, and the cart is emptied only after the server has saved it.
 */
export class CheckoutPage {
  #api
  #cartStorage
  #checkoutView
  /** @type {import('../model/Product.js').Product[]} The teas the shop sells. */
  #products = []
  /** @type {import('../model/ShoppingCartWrapper.js').ShoppingCartWrapper} The cart shown to the customer. */
  #cart

  /**
   * Gets the parts the page needs.
   *
   * @param {import('../services/ApiClient.js').ApiClient} api - Gets the teas and places the order.
   * @param {import('../services/CartStorage.js').CartStorage} cartStorage - Holds the saved cart.
   * @param {import('../components/tea-checkout/tea-checkout.js').TeaCheckout} checkoutView - Shows the page.
   */
  constructor(api, cartStorage, checkoutView) {
    this.#api = api
    this.#cartStorage = cartStorage
    this.#checkoutView = checkoutView
  }

  /**
   * Shows the saved cart as the order. An empty cart cannot be ordered.
   */
  async show() {
    try {
      this.#products = await this.#api.getProducts()
      this.#cart = this.#cartStorage.load(this.#products)
    } catch (error) {
      if (error instanceof ApiError) {
        this.#checkoutView.showCannotOrder('The order could not be loaded. Please try again later.')

        return
      }

      if (error instanceof CartStorageError) {
        this.#checkoutView.showCannotOrder(error.message)

        return
      }

      throw error
    }

    this.#checkoutView.onPlaceOrder((customer) => this.#placeOrder(customer))
    this.#showCart()
  }

  /**
   * A refused order keeps the cart, so the customer can change the form and try again.
   *
   * @param {{ name: string, email: string, street: string, postalCode: string, city: string }} customer - From the
   *   form.
   */
  async #placeOrder(customer) {
    if (this.#savedCartChanged()) {
      this.#cart = this.#cartStorage.load(this.#products)
      this.#showCart()

      if (!this.#cart.isEmpty) {
        this.#checkoutView.showOrderRefused('Your cart changed in another tab. Check the order and place it again.')
      }

      return
    }

    if (this.#cart.isEmpty) {
      this.#showCart()

      return
    }

    this.#checkoutView.showPlacingOrder()

    let receipt

    try {
      receipt = await this.#api.placeOrder(customer, this.#cart)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error
      }

      const isRefused = error.status === 400

      this.#checkoutView.showOrderRefused(
        isRefused ? error.message : 'The order could not be placed. Please try again later.'
      )

      return
    }

    this.#removeOrderedTeas()
    this.#checkoutView.goToReceipt(receipt)
  }

  /**
   * An empty cart cannot be ordered.
   */
  #showCart() {
    this.#checkoutView.showOrder(this.#cart)

    if (this.#cart.isEmpty) {
      this.#checkoutView.showCannotOrder('Your cart is empty. Add some tea in the shop first.')
    }
  }

  /**
   * A browser that no longer lets the shop read counts as no change, so the order shown can still be placed.
   *
   * @returns {boolean} True if another tab changed the saved cart.
   */
  #savedCartChanged() {
    try {
      return this.#cartStorage.differsFrom(this.#cart, this.#products)
    } catch (error) {
      if (!(error instanceof CartStorageError)) {
        throw error
      }

      return false
    }
  }

  /**
   * Teas another tab added while the order was sent stay in the cart. The order is saved even if the browser keeps
   * the cart, so the receipt is shown anyway.
   */
  #removeOrderedTeas() {
    try {
      this.#cartStorage.removeOrdered(this.#cart, this.#products)
    } catch (error) {
      if (!(error instanceof CartStorageError)) {
        throw error
      }
    }
  }
}
