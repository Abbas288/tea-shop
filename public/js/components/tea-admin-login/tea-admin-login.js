import { TeaElement } from '../TeaElement.js'
import { cssTemplate } from './tea-admin-login.css.js'
import { htmlTemplate } from './tea-admin-login.html.js'

/**
 * The admin's login form. The browser checks the form before the admin can send it.
 */
export class TeaAdminLogin extends TeaElement {
  #form
  #message
  #logInButton

  /**
   * Builds the form in a shadow root.
   */
  constructor() {
    super(htmlTemplate, cssTemplate)

    this.#form = this.shadowRoot.querySelector('#login-form')
    this.#message = this.shadowRoot.querySelector('#login-message')
    this.#logInButton = this.#form.querySelector('button[type="submit"]')
  }

  /**
   * Disables the button while the login is checked, so it is not sent twice.
   */
  showLoggingIn() {
    this.#message.textContent = 'Logging in...'
    this.#logInButton.disabled = true
  }

  /**
   * Shows why the admin is not logged in and lets the admin try again. Focus moves to the message.
   *
   * @param {string} message - Such as "Wrong email address or password."
   */
  showLoginRefused(message) {
    this.#message.textContent = message
    this.#logInButton.disabled = false
    this.#message.focus()
  }

  /**
   * Opens the admin page.
   */
  goToPanel() {
    window.location.assign('admin')
  }

  /**
   * Calls the handler when the admin sends a valid form. The page does not reload.
   *
   * @param {(login: { email: string, password: string }) => void} handler - Gets the values of the form.
   */
  onLogIn(handler) {
    this.#form.addEventListener('submit', (event) => {
      event.preventDefault()
      handler(Object.fromEntries(new FormData(this.#form)))
    })
  }
}
