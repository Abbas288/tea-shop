import { CartStorageError } from './CartStorageError.js'
import { QuantityError } from './QuantityError.js'
import { ShoppingCartWrapper } from './ShoppingCartWrapper.js'

const STORAGE_KEY = 'tea-shop-cart'

/**
 * Keeps the cart in the browser between pages and visits. Only the name and the bags of each tea are saved, with
 * the discount code, and the prices come from the shop when the cart is loaded.
 */
export class CartStorage {
  #storage

  /**
   * Saves the cart in the given storage.
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
   * @throws {CartStorageError} If the browser does not let the shop save.
   */
  save(cart) {
    const savedText = JSON.stringify(this.#savedFormOf(cart))

    try {
      this.#storage.setItem(STORAGE_KEY, savedText)
    } catch (error) {
      throw new CartStorageError({ cause: error })
    }
  }

  /**
   * Whether the saved cart holds other teas, bags or discount code than the given cart, for example after a change
   * in another tab.
   *
   * @param {ShoppingCartWrapper} cart - The cart the page shows.
   * @param {import('./Product.js').Product[]} products - The teas the shop sells.
   * @returns {boolean} True if they differ.
   * @throws {CartStorageError} If the browser does not let the shop read.
   */
  differsFrom(cart, products) {
    const savedCart = this.load(products)

    return JSON.stringify(this.#savedFormOf(savedCart)) !== JSON.stringify(this.#savedFormOf(cart))
  }

  /**
   * Takes the ordered bags out of the saved cart. Bags that another tab added while the order was sent stay, and a
   * cart with nothing left is forgotten with its discount code.
   *
   * @param {ShoppingCartWrapper} orderedCart - The cart that was ordered.
   * @param {import('./Product.js').Product[]} products - The teas the shop sells.
   * @throws {CartStorageError} If the browser does not let the shop read or save.
   */
  removeOrdered(orderedCart, products) {
    const savedCart = this.load(products)

    for (const orderedLine of orderedCart.listLines()) {
      this.#removeBags(savedCart, orderedLine)
    }

    if (savedCart.isEmpty) {
      this.clear()

      return
    }

    this.save(savedCart)
  }

  /**
   * Forgets the saved cart and its discount code.
   *
   * @throws {CartStorageError} If the browser does not let the shop change what it saved.
   */
  clear() {
    try {
      this.#storage.removeItem(STORAGE_KEY)
    } catch (error) {
      throw new CartStorageError({ cause: error })
    }
  }

  /**
   * The saved cart, with the prices the shop has now. A tea the shop does not sell, or a line or discount that
   * cannot be read, is left out. With nothing saved, the cart is empty.
   *
   * @param {import('./Product.js').Product[]} products - The teas the shop sells.
   * @returns {ShoppingCartWrapper} A new cart.
   * @throws {CartStorageError} If the browser does not let the shop read.
   */
  load(products) {
    const cart = new ShoppingCartWrapper()
    const { lines, discount } = this.#readSaved()

    for (const savedLine of lines) {
      const product = products.find((candidate) => candidate.name === savedLine?.name)

      if (product !== undefined) {
        this.#addUnlessInvalid(cart, product, savedLine.quantity)
      }
    }

    if (discount !== null) {
      this.#applyDiscountUnlessInvalid(cart, discount)
    }

    return cart
  }

  /**
   * A tea that is no longer in the saved cart is left alone.
   *
   * @param {ShoppingCartWrapper} savedCart - The cart in the browser now.
   * @param {import('./CartLine.js').CartLine} orderedLine - One tea of the order.
   */
  #removeBags(savedCart, orderedLine) {
    const productName = orderedLine.product.name
    const savedLine = savedCart.listLines().find((line) => line.product.name === productName)

    if (savedLine === undefined) {
      return
    }

    const bagsLeft = savedLine.quantity - orderedLine.quantity

    if (bagsLeft > 0) {
      savedCart.changeQuantity(productName, bagsLeft)
    } else {
      savedCart.remove(productName)
    }
  }

  /**
   * Only names and bags, so that the prices always come from the shop.
   *
   * @param {ShoppingCartWrapper} cart - The cart to save.
   * @returns {{ lines: Array<{ name: string, quantity: number }>, discount: object | null }} What is saved.
   */
  #savedFormOf(cart) {
    const lines = cart.listLines().map((line) => ({ name: line.product.name, quantity: line.quantity }))
    const discount = cart.discountCode === '' ? null : { code: cart.discountCode, percent: cart.discountPercent }

    return { lines, discount }
  }

  /**
   * A cart saved before discounts was only a list of lines. Anything else counts as nothing saved.
   *
   * @returns {{ lines: *[], discount: * }} The saved lines and discount, not checked.
   */
  #readSaved() {
    const savedText = this.#readSavedText()

    try {
      const saved = JSON.parse(savedText)

      if (Array.isArray(saved)) {
        return { lines: saved, discount: null }
      }

      if (Array.isArray(saved?.lines)) {
        return { lines: saved.lines, discount: saved.discount ?? null }
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error
      }
    }

    return { lines: [], discount: null }
  }

  /**
   * The browser may refuse, for example when its site data is blocked.
   *
   * @returns {string | null} The saved text, or null if nothing is saved.
   */
  #readSavedText() {
    try {
      return this.#storage.getItem(STORAGE_KEY)
    } catch (error) {
      throw new CartStorageError({ cause: error })
    }
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
      if (!(error instanceof TypeError || error instanceof QuantityError)) {
        throw error
      }
    }
  }

  /**
   * A saved discount can be anything the browser holds.
   *
   * @param {ShoppingCartWrapper} cart - The cart being loaded.
   * @param {*} discount - The saved code and percent.
   */
  #applyDiscountUnlessInvalid(cart, discount) {
    try {
      cart.applyDiscount(discount.code, discount.percent)
    } catch (error) {
      if (!(error instanceof TypeError || error instanceof RangeError)) {
        throw error
      }
    }
  }
}
