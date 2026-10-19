/**
 * A tea in the shop. Every value is checked when the product is created, and none can change after that.
 */
export class Product {
  #name
  #description
  #price
  #image

  /**
   * Checks every value before the product is created.
   *
   * @param {object} details - The tea.
   * @param {string} details.name - Such as "Earl Grey", without spaces at the start or end.
   * @param {string} details.description - One or two short sentences.
   * @param {number} details.price - A positive integer.
   * @param {string} details.image - Path to the picture, such as "images/teas/earl-grey.webp".
   * @throws {TypeError} If a value is missing, empty or of the wrong type, or the name starts or ends with a space.
   * @throws {RangeError} If the price is not a positive integer.
   */
  constructor({ name, description, price, image } = {}) {
    this.#name = this.#requireName(name)
    this.#description = this.#requireText(description, 'description')
    this.#price = this.#requirePrice(price)
    this.#image = this.#requireText(image, 'image')
  }

  /**
   * Unique in the catalog.
   *
   * @returns {string} Such as "Earl Grey".
   */
  get name() {
    return this.#name
  }

  /**
   * The shape sent to the browser. JSON.stringify calls it.
   *
   * @returns {{ name: string, description: string, price: number, image: string }} A plain copy.
   */
  toJSON() {
    return {
      name: this.#name,
      description: this.#description,
      price: this.#price,
      image: this.#image,
    }
  }

  /**
   * Spaces at the edges would let "Rooibos " pass as a second name.
   *
   * @param {*} value - The value to check.
   * @returns {string} The value.
   */
  #requireName(value) {
    const name = this.#requireText(value, 'name')

    if (name !== name.trim()) {
      throw new TypeError('A product name cannot start or end with a space.')
    }

    return name
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
   * An integer price avoids rounding errors when an order is added up.
   *
   * @param {*} value - The value to check.
   * @returns {number} The value.
   */
  #requirePrice(value) {
    if (typeof value !== 'number') {
      throw new TypeError('A product needs a price.')
    }

    if (!Number.isInteger(value) || value <= 0) {
      throw new RangeError('A price must be a positive integer.')
    }

    return value
  }
}
