import { ApiError } from '../services/ApiError.js'

/**
 * The admin page. The admin sees the orders, opens one and changes its status.
 */
export class AdminPage {
  #api
  #logOutButton
  #orderAdmin

  /**
   * Gets the parts the page needs.
   *
   * @param {import('../services/ApiClient.js').ApiClient} api - Fetches and changes the orders, and logs out.
   * @param {HTMLButtonElement} logOutButton - In the page's top bar.
   * @param {import('../components/tea-admin-orders/tea-admin-orders.js').TeaAdminOrders} orderAdmin - Shows the
   *   orders.
   */
  constructor(api, logOutButton, orderAdmin) {
    this.#api = api
    this.#logOutButton = logOutButton
    this.#orderAdmin = orderAdmin
  }

  /**
   * Shows the orders and lets the admin open them, change their status and log out.
   */
  async show() {
    this.#logOutButton.addEventListener('click', () => this.#logOut())
    this.#orderAdmin.onOpen((number) => this.#openOrder(number))
    this.#orderAdmin.onStatusChange((number, eventName) =>
      this.#changeStatus(number, () => this.#api.changeOrderStatus(number, eventName))
    )
    this.#orderAdmin.onUndo((number) => this.#changeStatus(number, () => this.#api.undoOrderStatus(number)))

    await this.#showOrders()
  }

  /**
   * A problem with the API is shown.
   */
  async #showOrders() {
    try {
      this.#orderAdmin.showOrders(await this.#api.getAdminOrders())
    } catch (error) {
      this.#showProblem(error)
    }
  }

  /**
   * A problem with the API is shown.
   *
   * @param {string} number - The order to open.
   */
  async #openOrder(number) {
    try {
      this.#orderAdmin.showOrder(await this.#api.getAdminOrder(number))
    } catch (error) {
      this.#showProblem(error)
    }
  }

  /**
   * Shows the changed order and updates the list. After a refused change, the order and the list are fetched again,
   * since another tab may have changed the order, and the reason is shown.
   *
   * @param {string} number - The open order.
   * @param {() => Promise<import('../services/ApiClient.js').AdminOrder>} sendChange - Asks the server for the change.
   */
  async #changeStatus(number, sendChange) {
    try {
      this.#orderAdmin.showOrder(await sendChange())
    } catch (error) {
      await this.#openOrder(number)
      await this.#showOrders()
      this.#showProblem(error)

      return
    }

    await this.#showOrders()
  }

  /**
   * An ended session opens the login page. A refused change (409) shows the server's reason, and any other problem
   * with the API a general message. Other errors are thrown again.
   *
   * @param {Error} error - From ApiClient.
   */
  #showProblem(error) {
    if (!(error instanceof ApiError)) {
      throw error
    }

    if (error.status === 401) {
      window.location.assign('admin-login')

      return
    }

    this.#orderAdmin.showMessage(
      error.status === 409 ? error.message : 'The orders could not be loaded or changed. Please try again later.'
    )
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
