import productDetails from '../../data/products.json' with { type: 'json' }
import { Product } from '../../models/Product.js'
import { ProductCatalog } from '../../models/ProductCatalog.js'

/**
 * Handles the requests about the teas the shop sells.
 */
export class ProductController {
  #productCatalog = new ProductCatalog(productDetails.map((details) => new Product(details)))

  /**
   * Sends every tea as JSON, in the order to show them.
   *
   * @param {import('express').Request} _req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  findAll(_req, res) {
    res.json(this.#productCatalog.listProducts())
  }
}
