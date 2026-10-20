import { ApiError } from '../services/ApiError.js'

/**
 * The admin page.
 */
export class AdminPage {
  #api
  #logOutButton

  /**
   * Gets the parts the page needs.
   *
   * @param {import('../services/ApiClient.js').ApiClient} api - Logs the admin out.
   * @param {HTMLButtonElement} logOutButton - In the page's top bar.
   */
  constructor(api, logOutButton) {
    this.#api = api
    this.#logOutButton = logOutButton
  }

  /**
   * Lets the admin log out with the button.
   */
  show() {
    this.#logOutButton.addEventListener('click', () => this.#logOut())
  }

  /**
   * Opens the login page once the session has ended. If the server cannot end it, the button says so and the admin
   * stays. Other errors are thrown again.
   */
  async #logOut() {
    try {
      await this.#api.logOut()
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error
      }

      this.#logOutButton.textContent = 'Log out failed. Try again.'

      return
    }

    window.location.assign('admin-login')
  }
}
