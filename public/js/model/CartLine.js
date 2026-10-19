/**
 * One tea in the cart, with its bags and what they cost.
 * A line does not change when the cart changes.
 */
export class CartLine {
  #product
  #quantity
  #total

  /**
   * The values are not checked.
   *
   * @param {import('./Product.js').Product} product - The tea.
   * @param {number} quantity - Bags, 1 or more.
   * @param {number} total - What the bags cost together, in kronor.
   */
  constructor(product, quantity, total) {
    this.#product = product
    this.#quantity = quantity
    this.#total = total
  }

  /**
   * Name, price and picture.
   *
   * @returns {import('./Product.js').Product} The tea.
   */
  get product() {
    return this.#product
  }

  /**
   * Bags of the tea.
   *
   * @returns {number} 1 or more.
   */
  get quantity() {
    return this.#quantity
  }

  /**
   * What the bags cost together.
   *
   * @returns {number} Kronor.
   */
  get total() {
    return this.#total
  }
}
