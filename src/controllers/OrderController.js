import createError from 'http-errors'
import { ORDER_EVENTS } from '../constants/orderStatuses.js'
import { DiscountCodeModel } from '../models/DiscountCodeModel.js'
import { OrderLifecycle } from '../models/OrderLifecycle.js'
import { OrderModel } from '../models/OrderModel.js'
import { ProductModel } from '../models/ProductModel.js'
import { StatusChangeError } from '../models/StatusChangeError.js'

// One message for an unknown number and for a wrong email address. Tracking does not tell which one was wrong.
const ORDER_NOT_FOUND = 'There is no order to show.'

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
   * Sends every order for the admin's list, newest first.
   *
   * @param {import('express').Request} _req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async findAll(_req, res) {
    const orderDocs = await OrderModel.find().sort({ createdAt: -1 })

    res.json(orderDocs.map((orderDoc) => this.#summaryOf(orderDoc)))
  }

  /**
   * Sends the order with the customer, the teas and the events the admin can send now.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  find(req, res) {
    res.json(this.#detailsOf(req.doc))
  }

  /**
   * Changes the order's status with the event in the body, such as { "event": "pack" }, and sends the order. An
   * unknown event gets 400, and an event the order cannot take now gets 409.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async changeStatus(req, res) {
    const event = req.body?.event
    const lifecycle = new OrderLifecycle(req.doc.status, req.doc.statusEvents)

    if (!Object.values(ORDER_EVENTS).includes(event)) {
      throw createError(400, 'Choose pack, ship, deliver or cancel.')
    }

    this.#changeOrRefuse(() => lifecycle.changeStatus(event))
    await this.#saveStatus(req.doc, lifecycle)

    res.json(this.#detailsOf(req.doc))
  }

  /**
   * Undoes the order's latest status change and sends the order. An order without a change to undo gets 409.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async undoStatusChange(req, res) {
    const lifecycle = new OrderLifecycle(req.doc.status, req.doc.statusEvents)

    this.#changeOrRefuse(() => lifecycle.undoLastChange())
    await this.#saveStatus(req.doc, lifecycle)

    res.json(this.#detailsOf(req.doc))
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
   * The order as a row in the admin's list.
   *
   * @param {import('mongoose').Document & object} orderDoc - The order.
   * @returns {{ number: string, createdAt: Date, status: string, total: number }} What the list shows.
   */
  #summaryOf(orderDoc) {
    return { number: orderDoc.number, createdAt: orderDoc.createdAt, status: orderDoc.status, total: orderDoc.total }
  }

  /**
   * Names each field the admin sees, so nothing else in the order is sent.
   *
   * @param {import('mongoose').Document & object} orderDoc - The order.
   * @returns {object} The order for the admin, with the events it can take now.
   */
  #detailsOf(orderDoc) {
    const { name, email, street, postalCode, city } = orderDoc.customer
    const lifecycle = new OrderLifecycle(orderDoc.status, orderDoc.statusEvents)

    return {
      number: orderDoc.number,
      createdAt: orderDoc.createdAt,
      status: orderDoc.status,
      statusChangedAt: orderDoc.statusChangedAt,
      customer: { name, email, street, postalCode, city },
      lines: orderDoc.lines.map((line) => ({ name: line.name, price: line.price, quantity: line.quantity })),
      subtotal: orderDoc.subtotal,
      discountCode: orderDoc.discountCode,
      discount: orderDoc.discount,
      total: orderDoc.total,
      allowedEvents: lifecycle.listAllowedEvents(),
      lastEvent: lifecycle.lastEvent,
    }
  }

  /**
   * A change the order cannot take now becomes 409 with the reason.
   *
   * @param {() => void} change - Changes the order's lifecycle, such as () => lifecycle.changeStatus('pack').
   */
  #changeOrRefuse(change) {
    try {
      change()
    } catch (error) {
      if (!(error instanceof StatusChangeError)) {
        throw error
      }

      throw createError(409, error.message, { cause: error })
    }
  }

  /**
   * Saves the lifecycle's status and events, and when the status changed.
   *
   * @param {import('mongoose').Document & object} orderDoc - The order.
   * @param {OrderLifecycle} lifecycle - The order's changed lifecycle.
   */
  async #saveStatus(orderDoc, lifecycle) {
    orderDoc.status = lifecycle.status
    orderDoc.statusEvents = lifecycle.listEvents()
    orderDoc.statusChangedAt = new Date()
    await orderDoc.save()
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
