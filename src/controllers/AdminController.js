import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import createError from 'http-errors'
import { AdminModel } from '../models/AdminModel.js'

const ADMIN_PAGE = fileURLToPath(new URL('../views/admin.html', import.meta.url))

/**
 * Handles the admin's login, logout and page.
 */
export class AdminController {
  /**
   * Logs the admin in with a new session id, which stops session fixation. A wrong email address or password gets
   * 401.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async login(req, res) {
    const { email, password } = req.body ?? {}
    const admin = await this.#authenticate(email, password)

    await promisify(req.session.regenerate).call(req.session)
    req.session.admin = { email: admin.email }

    res.json({ email: admin.email })
  }

  /**
   * Ends the session, also when nobody is logged in.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async logout(req, res) {
    await promisify(req.session.destroy).call(req.session)

    res.status(204).end()
  }

  /**
   * Sends the admin page to a logged-in admin. Anyone else is sent to the login page.
   *
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  showPanel(req, res) {
    if (!req.session.admin) {
      res.redirect('admin-login')

      return
    }

    res.sendFile(ADMIN_PAGE)
  }

  /**
   * Every failure gets the same 401, which hides whether the email address is an admin's.
   *
   * @param {*} email - What the browser sent.
   * @param {*} password - What the browser sent.
   * @returns {Promise<import('mongoose').Document & { email: string }>} The admin.
   */
  async #authenticate(email, password) {
    try {
      return await AdminModel.authenticate(email, password)
    } catch (error) {
      throw createError(401, 'Wrong email address or password.', { cause: error })
    }
  }
}
