import { ShoppingCart } from '../../modules/shopping-cart/index.js'
import { CartLine } from './CartLine.js'
import { Product } from './Product.js'
import { QuantityError } from './QuantityError.js'

/**
 * The customer's cart. It wraps the ShoppingCart package, throws where the package answers false and allows
 * 1 to 99 bags of each tea.
 */
export class ShoppingCartWrapper {
  #maxBagsPerTea = 99
  #shoppingCart = new ShoppingCart()
  #discountCode = ''
  #discountPercent = 0
  /** @type {Map<string, Product>} The teas in the cart, by name. */
  #products = new Map()

  /**
   * Adds bags of a tea. A tea already in the cart gets more bags, at the price it had when it was first added.
   *
   * @param {Product} product - The tea.
   * @param {number} quantity - Bags to add, 1 or more.
   * @throws {TypeError} If product is not a Product.
   * @throws {QuantityError} If quantity is not an integer, or the tea would get fewer than 1 or more than 99 bags.
   */
  add(product, quantity) {
    if (!(product instanceof Product)) {
      throw new TypeError('Only a product can be added to the cart.')
    }

    this.#requireQuantity(quantity)
    this.#requireQuantity(this.#bagsOf(product.name) + quantity)

    if (!this.has(product.name)) {
      this.#products.set(product.name, product)
    }

    this.#shoppingCart.addItem(product.name, product.price, quantity)
  }

  /**
   * Sets the bags of a tea in the cart.
   *
   * @param {string} productName - Such as "Earl Grey".
   * @param {number} quantity - Bags, 1 to 99.
   * @throws {QuantityError} If quantity is not an integer from 1 to 99.
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
   * Takes a percent off the total. A new code replaces the one before.
   *
   * @param {string} code - Such as "SAVE10".
   * @param {number} percent - An integer from 1 to 100.
   * @throws {TypeError} If code is empty or not text.
   * @throws {RangeError} If percent is not an integer from 1 to 100.
   */
  applyDiscount(code, percent) {
    if (typeof code !== 'string' || code.trim() === '') {
      throw new TypeError('A discount needs a code.')
    }

    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      throw new RangeError('A discount must be an integer from 1 to 100 percent.')
    }

    this.#shoppingCart.applyDiscount(percent)
    this.#discountCode = code
    this.#discountPercent = percent
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
   * What the customer pays, rounded to whole kronor.
   *
   * @returns {number} Kronor.
   */
  get total() {
    return Math.round(this.#shoppingCart.getTotalPrice())
  }

  /**
   * What the discount takes off, in whole kronor.
   *
   * @returns {number} 0 without a discount.
   */
  get discount() {
    return this.subtotal - this.total
  }

  /**
   * Such as "SAVE10".
   *
   * @returns {string} The code in use, or an empty string.
   */
  get discountCode() {
    return this.#discountCode
  }

  /**
   * The percent the code takes off.
   *
   * @returns {number} 0 without a discount.
   */
  get discountPercent() {
    return this.#discountPercent
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
   * The most bags the cart takes of one tea.
   *
   * @returns {number} 99.
   */
  get maxBagsPerTea() {
    return this.#maxBagsPerTea
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
   * An integer from 1 to 99.
   *
   * @param {*} quantity - The value to check.
   */
  #requireQuantity(quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > this.#maxBagsPerTea) {
      throw new QuantityError()
    }
  }

  /**
   * Zero for a tea that is not in the cart.
   *
   * @param {string} productName - The tea to count.
   * @returns {number} Its bags.
   */
  #bagsOf(productName) {
    const item = this.#shoppingCart.getItems().find((candidate) => candidate.getName() === productName)

    return item?.getQuantity() ?? 0
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
