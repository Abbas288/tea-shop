import createError from 'http-errors'

/**
 * Keeps the admin's routes for a logged-in admin.
 */
export class AdminGuard {
  /**
   * Lets the request through only with an admin's session. Anyone else gets 401.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} _res - Express response object.
   * @param {import('express').NextFunction} next - Express next middleware function.
   */
  requireLogin(req, _res, next) {
    if (!req.session.admin) {
      throw createError(401, 'Log in as admin first.')
    }

    next()
  }
}
