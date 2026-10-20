/**
 * The shop's API could not be reached,
 * or did not send what was asked for.
 */
export class ApiError extends Error {
  #status

  /**
   * The name shows in the console, such as "ApiError: The server answered 500 …".
   *
   * @param {string} message - What went wrong.
   * @param {{ cause?: *, status?: number }} [options] - The error that caused this one, and the HTTP status if the
   *   server answered.
   */
  constructor(message, { cause, status } = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.#status = status
  }

  /**
   * The HTTP status of the answer, such as 404.
   *
   * @returns {number | undefined} Undefined if the server never answered.
   */
  get status() {
    return this.#status
  }
}
