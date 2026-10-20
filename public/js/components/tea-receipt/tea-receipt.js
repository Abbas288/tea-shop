import { TeaElement } from '../TeaElement.js'
import { htmlTemplate } from './tea-receipt.html.js'

/**
 * The thank-you page's receipt, with the order number and the link to track the order.
 */
export class TeaReceipt extends TeaElement {
  #message
  #orderNumber
  #tracking

  /**
   * Builds the receipt in a shadow root.
   */
  constructor() {
    super(htmlTemplate)

    this.#message = this.shadowRoot.querySelector('#receipt-message')
    this.#orderNumber = this.shadowRoot.querySelector('#order-number')
    this.#tracking = this.shadowRoot.querySelector('#tracking')
  }

  /**
   * Shows the order number from the address. Without a number there is no order to show.
   */
  show() {
    const receiptParameters = new URLSearchParams(window.location.search)
    const number = receiptParameters.get('number')

    if (!number) {
      this.#message.textContent = 'There is no order to show.'
      this.#tracking.hidden = true

      return
    }

    this.#orderNumber.textContent = number
  }
}
