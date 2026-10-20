/**
 * The browser does not let the shop read or save the cart.
 */
export class CartStorageError extends Error {
  /**
   * Always has the same message.
   *
   * @param {{ cause?: * }} [options] - The error from the browser's storage.
   */
  constructor(options) {
    super('The browser does not let the shop save the cart.', options)
    this.name = 'CartStorageError'
  }
}
