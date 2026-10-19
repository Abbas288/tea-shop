import createError from 'http-errors'
import { DiscountCodeModel } from '../models/DiscountCodeModel.js'
import { OrderModel } from '../models/OrderModel.js'
import { ProductModel } from '../models/ProductModel.js'

/**
 * Handles the requests about orders.
 */
export class OrderController {
  /**
   * Saves a new order and sends its number and token. An order that cannot be placed gets 400 with a message.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async create(req, res) {
    const { customer, lines, discountCode } = req.body ?? {}
    const { name, email, street, postalCode, city } = customer ?? {}

    try {
      const discount = await this.#findDiscount(discountCode)
      const order = await OrderModel.create({
        customer: { name, email, street, postalCode, city },
        lines: await this.#linesWithShopPrices(lines),
        discountCode: discount.code,
        discountPercent: discount.percent,
      })

      res.status(201).json({ number: order.number, token: order.token })
    } catch (error) {
      if (error.name === 'ValidationError') {
        const [firstProblem] = Object.values(error.errors)

        throw createError(400, firstProblem.message)
      }

      throw error
    }
  }

  /**
   * Prices from the browser are not used.
   *
   * @param {*} lines - Such as [{ name: 'Rooibos', quantity: 2 }], as the browser sent them.
   * @returns {Promise<Array<{ name: string, price: number, quantity: * }>>} The lines with the shop's prices.
   */
  async #linesWithShopPrices(lines) {
    const products = await ProductModel.find()
    const orderedLines = Array.isArray(lines) ? lines : []

    return orderedLines.map((line) => {
      const product = products.find((candidate) => candidate.name === line?.name)

      if (!product) {
        throw createError(400, 'The cart has a tea the shop does not sell.')
      }

      return { name: product.name, price: product.price, quantity: line.quantity }
    })
  }

  /**
   * Only text is looked up, so an object such as { $ne: null } cannot match every code.
   *
   * @param {*} text - What the browser sent as the code, or nothing.
   * @returns {Promise<{ code: string, percent: number }>} The code and its percent, or an empty code and 0.
   */
  async #findDiscount(text) {
    if (!text) {
      return { code: '', percent: 0 }
    }

    const discountCode = typeof text === 'string' ? await DiscountCodeModel.findOne({ code: text }) : null

    if (!discountCode) {
      throw createError(400, 'Unknown discount code.')
    }

    return { code: discountCode.code, percent: discountCode.percent }
  }
}
