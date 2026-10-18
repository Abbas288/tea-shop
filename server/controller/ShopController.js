/**
 * What a customer can do in the shop. Each method is one use case. It knows nothing about HTTP: the
 * server turns the result into an answer.
 */
export class ShopController {
  #catalog

  /**
   * Nothing happens until a method is called.
   *
   * @param {import('../model/ProductCatalog.js').ProductCatalog} catalog - The teas the shop sells.
   */
  constructor(catalog) {
    this.#catalog = catalog
  }

  /**
   * The customer looks at the teas.
   *
   * @returns {import('../model/Product.js').Product[]} Every tea, in the order to show them.
   */
  listProducts() {
    return this.#catalog.listProducts()
  }
}
