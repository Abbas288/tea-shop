import createError from 'http-errors'
import { DiscountCodeModel } from '../models/DiscountCodeModel.js'

/**
 * Handles the requests about discount codes.
 */
export class DiscountController {
  /**
   * Sends the code and its percent as JSON, whatever the case of the code. An unknown code gets 404 with a message.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async find(req, res) {
    const discountCode = await DiscountCodeModel.findOne({ code: req.params.code })

    if (!discountCode) {
      throw createError(404, 'Unknown discount code.')
    }

    res.json(discountCode)
  }
}
