import createError from 'http-errors'
import { DiscountCodeModel } from '../models/DiscountCodeModel.js'
import { OrderLifecycle } from '../models/OrderLifecycle.js'
import { OrderModel } from '../models/OrderModel.js'
import { ProductModel } from '../models/ProductModel.js'

const ORDER_NOT_FOUND = 'There is no order with this number and email address.'

/**
 * Handles the requests about orders.
 */
export class OrderController {
  /**
   * Provides the order with the number in the address as req.doc. An unknown number gets 404.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} _res - Express response object.
   * @param {import('express').NextFunction} next - Express next middleware function.
   * @param {string} number - The order number in the address.
   */
  async loadOrderDocument(req, _res, next, number) {
    try {
      const orderDoc = await OrderModel.findOne({ number })

      if (!orderDoc) {
        throw createError(404, ORDER_NOT_FOUND)
      }

      req.doc = orderDoc

      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends the order's status and steps, without the customer.
   * The body has the customer's email address.
   * A wrong or missing address gets the same 404 as an unknown number,
   * which hides whether the order exists.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  track(req, res) {
    if (!this.#isCustomerEmail(req.doc, req.body?.email)) {
      throw createError(404, ORDER_NOT_FOUND)
    }

    const lifecycle = new OrderLifecycle(req.doc.status)

    res.json({
      number: req.doc.number,
      status: lifecycle.status,
      statusChangedAt: req.doc.statusChangedAt,
      completedSteps: lifecycle.listCompletedSteps(),
      remainingSteps: lifecycle.listRemainingSteps(),
    })
  }

  /**
   * Saves a new order and sends its number. An order that cannot be placed gets 400 with a message.
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

      res.status(201).json({ number: order.number })
    } catch (error) {
      if (error.name === 'ValidationError') {
        const [firstProblem] = Object.values(error.errors)

        throw createError(400, firstProblem.message)
      }

      throw error
    }
  }

  /**
   * Ignores capitals and spaces at the ends.
   *
   * @param {import('mongoose').Document & { customer: { email: string } }} orderDoc - The order.
   * @param {*} email - What the browser sent, or nothing.
   * @returns {boolean} True if it is the customer's address.
   */
  #isCustomerEmail(orderDoc, email) {
    if (typeof email !== 'string') {
      return false
    }

    const givenEmail = email.trim().toLowerCase()

    return givenEmail === orderDoc.customer.email.toLowerCase()
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
