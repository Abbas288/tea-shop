/**
 * A tea as the browser gets it from the shop's API. The values are checked when it is created, and a page
 * never shows a tea with a missing name or a price that is not a number.
 */
export class Product {
  #name
  #description
  #price
  #image

  /**
   * Checks every value before the product is created.
   *
   * @param {object} details - One tea from the API.
   * @param {string} details.name - Such as "Earl Grey".
   * @param {string} details.description - One or two short sentences.
   * @param {number} details.price - A positive integer.
   * @param {string} details.image - Path to the picture.
   * @throws {TypeError} If a value is missing or of the wrong type, or the price is not a positive integer.
   */
  constructor({ name, description, price, image } = {}) {
    this.#name = this.#requireText(name, 'name')
    this.#description = this.#requireText(description, 'description')
    this.#price = this.#requirePrice(price)
    this.#image = this.#requireText(image, 'image')
  }

  /**
   * Unique in the shop.
   *
   * @returns {string} Such as "Earl Grey".
   */
  get name() {
    return this.#name
  }

  /**
   * One or two short sentences.
   *
   * @returns {string} The description.
   */
  get description() {
    return this.#description
  }

  /**
   * Kronor for one bag.
   *
   * @returns {number} A positive integer.
   */
  get price() {
    return this.#price
  }

  /**
   * Path to the picture, on the shop's own server.
   *
   * @returns {string} Such as "/images/teas/earl-grey.webp".
   */
  get image() {
    return this.#image
  }

  /**
   * Text that is not only spaces.
   *
   * @param {*} value - The value to check.
   * @param {string} label - Its name in the error message.
   * @returns {string} The value.
   */
  #requireText(value, label) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new TypeError(`A product needs a ${label}.`)
    }

    return value
  }

  /**
   * A positive integer.
   *
   * @param {*} value - The value to check.
   * @returns {number} The value.
   */
  #requirePrice(value) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new TypeError('A price must be a positive integer.')
    }

    return value
  }
}
