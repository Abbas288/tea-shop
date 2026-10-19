/**
 * A number of bags the cart does not take.
 */
export class QuantityError extends Error {
  /**
   * Names the limits in the message.
   *
   * @param {number} minBagsPerTea - The fewest bags of one tea, such as 1.
   * @param {number} maxBagsPerTea - The most bags of one tea, such as 99.
   */
  constructor(minBagsPerTea, maxBagsPerTea) {
    super(`A tea can have ${minBagsPerTea} to ${maxBagsPerTea} bags.`)
    this.name = 'QuantityError'
  }
}
