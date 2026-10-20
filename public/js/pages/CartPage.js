import { ApiError } from '../services/ApiError.js'
import { CartStorageError } from '../services/CartStorageError.js'
import { QuantityError } from '../model/QuantityError.js'

/**
 * What the customer can do on the cart page. Each change starts from the saved cart, which another tab may have
 * changed.
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
   * @param {import('../services/ApiClient.js').ApiClient} api - Fetches the teas and their prices.
   * @param {import('../services/CartStorage.js').CartStorage} cartStorage - Keeps the cart between pages.
   * @param {import('../components/tea-cart/tea-cart.js').TeaCart} cartView - Shows the cart.
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

    this.#cartView.onAdjustQuantity((productName, step) => this.#adjustQuantity(productName, step))
    this.#cartView.onChangeQuantity((productName, quantity) => this.#changeQuantity(productName, quantity))
    this.#cartView.onRemove((productName) => this.#remove(productName))
    this.#cartView.onApplyDiscount((text) => this.#applyDiscount(text))
    this.#showSavedCart()
  }

  /**
   * Asks the shop for the code first. The server checks the code again when the order is placed.
   *
   * @param {string} text - What the customer typed.
   */
  async #applyDiscount(text) {
    if (text.trim() === '') {
      this.#cartView.showDiscountMessage('Enter a discount code.')

      return
    }

    let discountCode

    try {
      discountCode = await this.#api.getDiscountCode(text)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error
      }

      const isUnknownCode = error.status === 404

      this.#cartView.showDiscountMessage(
        isUnknownCode ? error.message : 'The code could not be checked. Try again later.'
      )

      return
    }

    this.#applyDiscountToSavedCart(discountCode)
  }

  /**
   * Tells the customer that the code is used only after the cart is saved.
   *
   * @param {{ code: string, percent: number }} discountCode - A code the shop has.
   */
  #applyDiscountToSavedCart(discountCode) {
    try {
      const cart = this.#cartStorage.load(this.#products)

      cart.applyDiscount(discountCode.code, discountCode.percent)
      this.#saveAndShow(cart)
      this.#cartView.showDiscountMessage(`${discountCode.code} takes ${discountCode.percent}% off.`)
    } catch (error) {
      this.#showWhyCartDidNotChange(error)
    }
  }

  /**
   * Adjusts the saved quantity without overwriting another tab's change.
   *
   * @param {string} productName - The tea.
   * @param {number} step - Bags to add or take away.
   */
  #adjustQuantity(productName, step) {
    try {
      const cart = this.#cartStorage.load(this.#products)

      if (cart.has(productName)) {
        const quantity = cart.countBagsOf(productName) + step

        cart.changeQuantity(productName, quantity)
      }

      this.#saveAndShow(cart)
    } catch (error) {
      this.#showWhyCartDidNotChange(error)
    }
  }

  /**
   * A tea that another tab removed is left alone.
   *
   * @param {string} productName - The tea.
   * @param {number} quantity - The new number of bags.
   */
  #changeQuantity(productName, quantity) {
    try {
      const cart = this.#cartStorage.load(this.#products)

      if (cart.has(productName)) {
        cart.changeQuantity(productName, quantity)
      }

      this.#saveAndShow(cart)
    } catch (error) {
      this.#showWhyCartDidNotChange(error)
    }
  }

  /**
   * A tea that another tab removed is left alone.
   *
   * @param {string} productName - The tea.
   */
  #remove(productName) {
    try {
      const cart = this.#cartStorage.load(this.#products)

      if (cart.has(productName)) {
        cart.remove(productName)
      }

      this.#saveAndShow(cart)
    } catch (error) {
      this.#showWhyCartDidNotChange(error)
    }
  }

  /**
   * A cart that could not be saved is not shown.
   *
   * @param {import('../model/ShoppingCartWrapper.js').ShoppingCartWrapper} cart - The changed cart.
   */
  #saveAndShow(cart) {
    this.#cartStorage.save(cart)
    this.#cartView.show(cart)
  }

  /**
   * A browser that does not let the shop read gets a message instead.
   */
  #showSavedCart() {
    try {
      const cart = this.#cartStorage.load(this.#products)

      this.#cartView.show(cart)
    } catch (error) {
      if (!(error instanceof CartStorageError)) {
        throw error
      }

      this.#cartView.showMessage(error.message)
    }
  }

  /**
   * A refused number of bags shows the saved cart again.
   *
   * @param {Error} error - Why the cart did not change.
   */
  #showWhyCartDidNotChange(error) {
    if (!(error instanceof QuantityError || error instanceof CartStorageError)) {
      throw error
    }

    if (error instanceof QuantityError) {
      this.#showSavedCart()
    }

    this.#cartView.showMessage(error.message)
  }
}
