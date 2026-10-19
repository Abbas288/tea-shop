import { Product } from './Product.js'

/**
 * The teas the shop sells, in the order they are shown. No two products share a name.
 */
export class ProductCatalog {
  /** @type {Product[]} */
  #products = []

  /**
   * Checks every product before the catalog is created.
   *
   * @param {Product[]} products - In the order to show them.
   * @throws {TypeError} If the list is not an array, or an item is not a Product.
   * @throws {RangeError} If the list is empty.
   * @throws {Error} If two products share a name.
   */
  constructor(products) {
    if (!Array.isArray(products)) {
      throw new TypeError('A catalog needs a list of products.')
    }

    if (products.length === 0) {
      throw new RangeError('A catalog needs at least one product.')
    }

    for (const product of products) {
      this.#add(product)
    }
  }

  /**
   * In the order to show them, in a new array each time.
   *
   * @returns {Product[]} Every product.
   */
  listProducts() {
    return [...this.#products]
  }

  /**
   * Refuses anything but a Product with a new name.
   *
   * @param {*} product - The value to add.
   */
  #add(product) {
    if (!(product instanceof Product)) {
      throw new TypeError('A catalog only holds products.')
    }

    const isNameTaken = this.#products.some((existing) => existing.name === product.name)

    if (isNameTaken) {
      throw new Error(`Two products are named "${product.name}".`)
    }

    this.#products.push(product)
  }
}
