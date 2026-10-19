/**
 * The shop has no such discount code.
 */
export class UnknownDiscountCodeError extends Error {
  /**
   * Always has the same message.
   */
  constructor() {
    super('Unknown discount code.')
    this.name = 'UnknownDiscountCodeError'
  }
}
