import http from 'node:http'

/**
 * Sends the error as JSON.
 */
export class ErrorHandler {
  /**
   * Shows the message only if `error.expose` is true. Other errors are logged.
   *
   * @param {Error & { status?: number, expose?: boolean }} error - The error to send.
   * @param {import('express').Request} _req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  handle(error, _req, res) {
    const status = error.status ?? 500

    if (!error.expose) {
      console.error(error)
    }

    res.status(status).json({
      status,
      message: error.expose ? error.message : http.STATUS_CODES[status],
    })
  }
}
