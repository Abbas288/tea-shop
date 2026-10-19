/**
 * A number of bags that is not an integer from 1 to 99.
 */
export class QuantityError extends Error {
  /**
   * Always has the same message.
   */
  constructor() {
    super('A tea can have 1 to 99 bags.')
    this.name = 'QuantityError'
  }
}
