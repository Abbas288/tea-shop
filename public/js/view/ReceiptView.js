/**
 * Shows the thank-you page with the order number and the link to track the order.
 */
export class ReceiptView {
  #message
  #orderNumber
  #tracking
  #trackingLink

  /**
   * Finds its parts by their ids inside the element it shows.
   *
   * @param {HTMLElement} root - The page's main element.
   */
  constructor(root) {
    this.#message = root.querySelector('#receipt-message')
    this.#orderNumber = root.querySelector('#order-number')
    this.#tracking = root.querySelector('#tracking')
    this.#trackingLink = root.querySelector('#tracking-link')
  }

  /**
   * Shows the order number from the address and links to the tracking page. Without a number and a token there is
   * no order to show.
   */
  show() {
    const receiptParameters = new URLSearchParams(window.location.search)
    const number = receiptParameters.get('number')
    const token = receiptParameters.get('token')

    if (!number || !token) {
      this.#message.textContent = 'There is no order to show.'
      this.#tracking.hidden = true

      return
    }

    const trackingParameters = new URLSearchParams({ number, token })

    this.#orderNumber.textContent = number
    this.#trackingLink.href = `track?${trackingParameters}`
  }
}
