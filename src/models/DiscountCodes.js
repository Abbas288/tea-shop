import { DiscountCode } from './DiscountCode.js'
import { UnknownDiscountCodeError } from './UnknownDiscountCodeError.js'

/**
 * The discount codes the shop accepts.
 */
export class DiscountCodes {
  /** @type {Map<string, DiscountCode>} The codes, by their text in capitals. */
  #codes = new Map()

  /**
   * Keeps every code.
   *
   * @param {DiscountCode[]} discountCodes - The codes the shop accepts.
   */
  constructor(discountCodes) {
    for (const discountCode of discountCodes) {
      this.#codes.set(discountCode.code, discountCode)
    }
  }

  /**
   * Finds a code whatever its case and the spaces around it.
   *
   * @param {string} text - What the customer typed, such as " save10".
   * @returns {DiscountCode} The code.
   * @throws {UnknownDiscountCodeError} If the shop has no such code.
   */
  find(text) {
    const discountCode = this.#codes.get(String(text).trim().toUpperCase())

    if (discountCode === undefined) {
      throw new UnknownDiscountCodeError()
    }

    return discountCode
  }
}
