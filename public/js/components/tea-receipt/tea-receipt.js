import { TeaElement } from '../TeaElement.js'
import { htmlTemplate } from './tea-receipt.html.js'

/**
 * The thank-you page's receipt, with the order number and the link to track the order.
 */
export class TeaReceipt extends TeaElement {
  #message
  #orderNumber
  #tracking
  #trackingLink

  /**
   * Builds the receipt in a shadow root.
   */
  constructor() {
    super(htmlTemplate)

    this.#message = this.shadowRoot.querySelector('#receipt-message')
    this.#orderNumber = this.shadowRoot.querySelector('#order-number')
    this.#tracking = this.shadowRoot.querySelector('#tracking')
    this.#trackingLink = this.shadowRoot.querySelector('#tracking-link')
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
