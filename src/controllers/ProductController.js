import { ProductModel } from '../models/ProductModel.js'

/**
 * Handles the requests about the teas the shop sells.
 */
export class ProductController {
  /**
   * Sends every tea as JSON, in the order to show them.
   *
   * @param {import('express').Request} _req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async findAll(_req, res) {
    const products = await ProductModel.find().sort({ name: 1 })

    res.json(products)
  }
}
