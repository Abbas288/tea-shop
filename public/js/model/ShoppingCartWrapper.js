import { ShoppingCart } from '1dv610-laboration-2'
import { CartLine } from './CartLine.js'
import { Product } from './Product.js'
import { QuantityError } from './QuantityError.js'

/**
 * The customer's cart. Wraps the ShoppingCart package: throws where the package answers false, and takes
 * only a positive integer as quantity.
 */
export class ShoppingCartWrapper {
  #shoppingCart = new ShoppingCart()
  /** @type {Map<string, Product>} The teas in the cart, by name. */
  #products = new Map()

  /**
   * Adds bags of a tea. A tea already in the cart gets more bags, at the price it had when it was first added.
   *
   * @param {Product} product - The tea.
   * @param {number} quantity - Bags to add, 1 or more.
   * @throws {TypeError} If product is not a Product.
   * @throws {QuantityError} If quantity is not a positive integer.
   */
  add(product, quantity) {
    if (!(product instanceof Product)) {
      throw new TypeError('Only a product can be added to the cart.')
    }

    this.#requireQuantity(quantity)

    if (!this.has(product.name)) {
      this.#products.set(product.name, product)
    }

    this.#shoppingCart.addItem(product.name, product.price, quantity)
  }

  /**
   * Sets the bags of a tea in the cart.
   *
   * @param {string} productName - Such as "Earl Grey".
   * @param {number} quantity - Bags, 1 or more.
   * @throws {QuantityError} If quantity is not a positive integer.
   * @throws {Error} If the tea is not in the cart.
   */
  changeQuantity(productName, quantity) {
    this.#requireQuantity(quantity)
    this.#requireInCart(productName)
    this.#shoppingCart.updateQuantity(productName, quantity)
  }

  /**
   * Takes a tea and all its bags out of the cart.
   *
   * @param {string} productName - Such as "Earl Grey".
   * @throws {Error} If the tea is not in the cart.
   */
  remove(productName) {
    this.#requireInCart(productName)
    this.#shoppingCart.removeItem(productName)
    this.#products.delete(productName)
  }

  /**
   * Whether the cart holds bags of the tea.
   *
   * @param {string} productName - Such as "Earl Grey".
   * @returns {boolean} True if the tea is in the cart.
   */
  has(productName) {
    return this.#shoppingCart.hasItem(productName)
  }

  /**
   * In the order the teas were first added, in a new array each time.
   *
   * @returns {CartLine[]} One line per tea.
   */
  listLines() {
    const items = this.#shoppingCart.getItems()

    return items.map(
      (item) => new CartLine(this.#products.get(item.getName()), item.getQuantity(), item.getTotalPrice())
    )
  }

  /**
   * What all the bags cost together.
   *
   * @returns {number} Kronor.
   */
  get subtotal() {
    return this.#shoppingCart.getSubtotal()
  }

  /**
   * What the customer pays.
   *
   * @returns {number} Kronor.
   */
  get total() {
    return this.#shoppingCart.getTotalPrice()
  }

  /**
   * Bags of all teas together.
   *
   * @returns {number} 0 or more.
   */
  get bagCount() {
    return this.#shoppingCart.getTotalItems()
  }

  /**
   * True when the cart holds no tea.
   *
   * @returns {boolean} Whether the cart is empty.
   */
  get isEmpty() {
    return this.#shoppingCart.isEmpty()
  }

  /**
   * Safe integers only: larger numbers lose their precision.
   *
   * @param {*} quantity - The value to check.
   */
  #requireQuantity(quantity) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      throw new QuantityError()
    }
  }

  /**
   * ShoppingCart answers false for a tea it does not hold.
   *
   * @param {string} productName - The tea to look for.
   */
  #requireInCart(productName) {
    if (!this.has(productName)) {
      throw new Error(`${productName} is not in the cart.`)
    }
  }
}
