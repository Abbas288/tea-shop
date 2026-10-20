import { TeaElement } from '../TeaElement.js'
import { htmlTemplate } from './tea-order-tracker.html.js'

/**
 * The tracking form, and the order it finds with its number, status, last change and steps. The browser checks the
 * form before the customer can send it.
 */
export class TeaOrderTracker extends TeaElement {
  #form
  #message
  #result
  #orderNumber
  #status
  #lastUpdated
  #steps
  #stepTemplate

  /**
   * Builds the form and the tracking box in a shadow root.
   */
  constructor() {
    super(htmlTemplate)

    this.#form = this.shadowRoot.querySelector('#tracking-form')
    this.#message = this.shadowRoot.querySelector('#tracking-message')
    this.#result = this.shadowRoot.querySelector('#tracking-result')
    this.#orderNumber = this.shadowRoot.querySelector('#order-number')
    this.#status = this.shadowRoot.querySelector('#order-status')
    this.#lastUpdated = this.shadowRoot.querySelector('#last-updated')
    this.#steps = this.shadowRoot.querySelector('#steps')
    this.#stepTemplate = this.shadowRoot.querySelector('#step-template')
  }

  /**
   * Shows the order, with the steps done before the steps left.
   *
   * @param {{ number: string, status: string, statusChangedAt: Date, completedSteps: string[],
   *   remainingSteps: string[] }} tracking - From ApiClient.getTracking.
   */
  show(tracking) {
    const doneRows = tracking.completedSteps.map((stepName) => this.#createRow(stepName, 'yes'))
    const rowsLeft = tracking.remainingSteps.map((stepName) => this.#createRow(stepName, 'no'))

    this.#message.textContent = ''
    this.#orderNumber.textContent = tracking.number
    this.#status.textContent = tracking.status
    this.#lastUpdated.textContent = tracking.statusChangedAt.toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    this.#steps.replaceChildren(...doneRows, ...rowsLeft)
    this.#result.hidden = false
  }

  /**
   * Shows the message instead of an order. Focus moves to the message.
   *
   * @param {string} message - Such as "There is no order with this number and email address."
   */
  showNoOrder(message) {
    this.#result.hidden = true
    this.#message.textContent = message
    this.#message.focus()
  }

  /**
   * Calls the handler when the customer sends a valid form. The page does not reload.
   *
   * @param {(lookup: { number: string, email: string }) => void} handler - Gets the values of the form.
   */
  onTrack(handler) {
    this.#form.addEventListener('submit', (event) => {
      event.preventDefault()
      handler(Object.fromEntries(new FormData(this.#form)))
    })
  }

  /**
   * A row made from the step template.
   *
   * @param {string} stepName - Such as "packed".
   * @param {string} done - "yes" or "no".
   * @returns {HTMLTableRowElement} The new row.
   */
  #createRow(stepName, done) {
    const row = this.#stepTemplate.content.firstElementChild.cloneNode(true)

    row.querySelector('.step-name').textContent = stepName
    row.querySelector('.step-done').textContent = done

    return row
  }
}
