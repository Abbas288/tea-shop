/**
 * Thrown when an order cannot take an event in its current step, such as "ship" for a received order.
 */
export class StatusChangeError extends Error {
  /**
   * Names the step and the event in the message.
   *
   * @param {string} status - Such as "received".
   * @param {string} eventName - Such as "ship".
   * @param {{ cause?: Error }} [options] - The error from flowstate-js.
   */
  constructor(status, eventName, options) {
    super(`A ${status} order cannot be changed with "${eventName}".`, options)
    this.name = 'StatusChangeError'
  }
}
