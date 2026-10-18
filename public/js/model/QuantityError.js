/**
 * A quantity that is not a positive integer.
 */
export class QuantityError extends Error {
  /**
   * Always has the same message.
   */
  constructor() {
    super('A quantity must be a positive integer.')
    this.name = 'QuantityError'
  }
}
