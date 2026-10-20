import { ApiError } from '../services/ApiError.js'

/**
 * The admin's login page.
 */
export class AdminLoginPage {
  #api
  #loginForm

  /**
   * Gets the parts the page needs.
   *
   * @param {import('../services/ApiClient.js').ApiClient} api - Logs the admin in.
   * @param {import('../components/tea-admin-login/tea-admin-login.js').TeaAdminLogin} loginForm - Shows the form.
   */
  constructor(api, loginForm) {
    this.#api = api
    this.#loginForm = loginForm
  }

  /**
   * Lets the admin log in with the form.
   */
  show() {
    this.#loginForm.onLogIn(({ email, password }) => this.#logIn(email, password))
  }

  /**
   * A wrong email address or password gets the server's message, and a server that cannot answer gets a message of
   * its own. Other errors are thrown again.
   *
   * @param {string} email - From the form.
   * @param {string} password - From the form.
   */
  async #logIn(email, password) {
    this.#loginForm.showLoggingIn()

    try {
      await this.#api.logIn(email, password)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error
      }

      this.#loginForm.showLoginRefused(
        error.status === 401 ? error.message : 'The login did not work. Please try again later.'
      )

      return
    }

    this.#loginForm.goToPanel()
  }
}
