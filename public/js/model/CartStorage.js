import { ShoppingCartWrapper } from './ShoppingCartWrapper.js'
import { QuantityError } from './QuantityError.js'

/**
 * Keeps the cart in the browser between pages and visits. Only the name and the bags of each tea are saved;
 * the prices come from the shop when the cart is loaded.
 */
export class CartStorage {
  #storage
  #key = 'tea-shop-cart'

  /**
   * Nothing is read or saved until load or save is called.
   *
   * @param {Storage} storage - Such as window.localStorage.
   */
  constructor(storage) {
    this.#storage = storage
  }

  /**
   * Replaces the cart that was saved before.
   *
   * @param {ShoppingCartWrapper} cart - The cart to save.
   */
  save(cart) {
    const savedLines = cart.listLines().map((line) => ({ name: line.product.name, quantity: line.quantity }))

    this.#storage.setItem(this.#key, JSON.stringify(savedLines))
  }

  /**
   * The saved cart, with the prices the shop has now. A tea the shop does not sell, or a line that cannot be
   * read, is left out. With nothing saved, the cart is empty.
   *
   * @param {import('./Product.js').Product[]} products - The teas the shop sells.
   * @returns {ShoppingCartWrapper} A new cart.
   */
  load(products) {
    const cart = new ShoppingCartWrapper()

    for (const savedLine of this.#readSavedLines()) {
      const product = products.find((candidate) => candidate.name === savedLine?.name)

      if (product !== undefined) {
        this.#addUnlessInvalid(cart, product, savedLine.quantity)
      }
    }

    return cart
  }

  /**
   * Anything but a saved list counts as no lines.
   *
   * @returns {*[]} The saved lines, not checked.
   */
  #readSavedLines() {
    try {
      const savedLines = JSON.parse(this.#storage.getItem(this.#key))

      if (Array.isArray(savedLines)) {
        return savedLines
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error
      }
    }

    return []
  }

  /**
   * A saved quantity can be anything the browser holds.
   *
   * @param {ShoppingCartWrapper} cart - The cart being loaded.
   * @param {import('./Product.js').Product} product - The tea.
   * @param {*} quantity - The saved bags.
   */
  #addUnlessInvalid(cart, product, quantity) {
    try {
      cart.add(product, quantity)
    } catch (error) {
      if (!(error instanceof QuantityError)) {
        throw error
      }
    }
  }
}
