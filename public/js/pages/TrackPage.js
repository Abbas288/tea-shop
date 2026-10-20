import { ApiError } from '../services/ApiError.js'

/**
 * The tracking page. The customer finds an order with its number and the email address it was placed with.
 */
export class TrackPage {
  #api
  #orderTracker

  /**
   * Gets the parts the page needs.
   *
   * @param {import('../services/ApiClient.js').ApiClient} api - Fetches where the order is.
   * @param {import('../components/tea-order-tracker/tea-order-tracker.js').TeaOrderTracker} orderTracker - Shows it.
   */
  constructor(api, orderTracker) {
    this.#api = api
    this.#orderTracker = orderTracker
  }

  /**
   * Lets the customer look up orders with the form.
   */
  show() {
    this.#orderTracker.onTrack(({ number, email }) => this.#track(number, email))
  }

  /**
   * Shows a message for an unknown order or a server that cannot answer. Other errors are thrown again.
   *
   * @param {string} number - From the form.
   * @param {string} email - From the form.
   */
  async #track(number, email) {
    try {
      this.#orderTracker.show(await this.#api.getTracking(number, email))
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error
      }

      this.#orderTracker.showNoOrder(
        error.status === 404
          ? 'There is no order with this number and email address.'
          : 'The order could not be loaded. Please try again later.'
      )
    }
  }
}
