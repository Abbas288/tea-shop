/**
 * The shop's API could not be reached,
 * or did not send what was asked for.
 */
export class ApiError extends Error {
  /**
   * The name shows in the console, such as "ApiError: The server answered 500 …".
   *
   * @param {string} message - What went wrong.
   * @param {{ cause?: * }} [options] - The error that caused this one, if any.
   */
  constructor(message, options) {
    super(message, options)
    this.name = 'ApiError'
  }
}
