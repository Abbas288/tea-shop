import createError from 'http-errors'
import discountCodeDetails from '../../data/discountCodes.json' with { type: 'json' }
import { DiscountCode } from '../../models/DiscountCode.js'
import { DiscountCodes } from '../../models/DiscountCodes.js'
import { UnknownDiscountCodeError } from '../../models/UnknownDiscountCodeError.js'

/**
 * Handles the requests about discount codes.
 */
export class DiscountController {
  #discountCodes = new DiscountCodes(discountCodeDetails.map((details) => new DiscountCode(details)))

  /**
   * Sends the code and its percent as JSON. An unknown code gets 404 with a message.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  find(req, res) {
    try {
      res.json(this.#discountCodes.find(req.params.code))
    } catch (error) {
      if (error instanceof UnknownDiscountCodeError) {
        throw createError(404, error.message)
      }

      throw error
    }
  }
}
