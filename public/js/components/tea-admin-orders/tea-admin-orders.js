import { TeaElement } from '../TeaElement.js'
import { cssTemplate } from './tea-admin-orders.css.js'
import { htmlTemplate } from './tea-admin-orders.html.js'

const DATE_FORMAT = { dateStyle: 'medium', timeStyle: 'short' }
const CANCEL = 'cancel'

/**
 * The admin's list of orders, and the open order with a button for each event it can take.
 */
export class TeaAdminOrders extends TeaElement {
  #message
  #orders
  #orderRowTemplate
  #openOrder
  #openNumber
  #statusButtons
  #lines
  #lineRowTemplate

  /**
   * Builds the list and the order view in a shadow root.
   */
  constructor() {
    super(htmlTemplate, cssTemplate)

    this.#message = this.shadowRoot.querySelector('#orders-message')
    this.#orders = this.shadowRoot.querySelector('#orders')
    this.#orderRowTemplate = this.shadowRoot.querySelector('#order-row-template')
    this.#openOrder = this.shadowRoot.querySelector('#open-order')
    this.#statusButtons = this.shadowRoot.querySelector('#status-buttons')
    this.#lines = this.shadowRoot.querySelector('#order-lines')
    this.#lineRowTemplate = this.shadowRoot.querySelector('#line-row-template')
  }

  /**
   * Shows a row with an Open button for each order.
   *
   * @param {import('../../services/ApiClient.js').OrderSummary[]} orders - Newest first.
   */
  showOrders(orders) {
    const rows = orders.map((order) => this.#createOrderRow(order))

    this.#orders.replaceChildren(...rows)
    this.#message.textContent = orders.length === 0 ? 'There are no orders yet.' : ''
  }

  /**
   * Shows the order, with a button for each event it can take now. Cancel is red.
   *
   * @param {import('../../services/ApiClient.js').AdminOrder} order - From ApiClient.
   */
  showOrder(order) {
    const { name, email, street, postalCode, city } = order.customer
    const lineRows = order.lines.map((line) => this.#createLineRow(line))
    const buttons = order.allowedEvents.map((eventName) => this.#createStatusButton(eventName))

    this.#openNumber = order.number
    this.#setText('#order-number', order.number)
    this.#setText('#order-status', order.status)
    this.#setText('#status-changed', order.statusChangedAt.toLocaleString('en-GB', DATE_FORMAT))
    this.#setText('#customer-name', name)
    this.#setText('#customer-email', email)
    this.#setText('#customer-street', street)
    this.#setText('#customer-city', `${postalCode} ${city}`)
    this.#setText('#order-subtotal', `${order.subtotal} kr`)
    this.#setText('#order-discount-label', order.discountCode === '' ? 'Discount' : `Discount (${order.discountCode})`)
    this.#setText('#order-discount', order.discount === 0 ? '0 kr' : `−${order.discount} kr`)
    this.#setText('#order-total', `${order.total} kr`)
    this.#lines.replaceChildren(...lineRows)
    this.#statusButtons.replaceChildren(...buttons)
    this.#message.textContent = ''
    this.#openOrder.hidden = false
  }

  /**
   * Shows the message above the list. Focus moves to it.
   *
   * @param {string} message - Such as "A received order cannot be changed with "ship"."
   */
  showMessage(message) {
    this.#message.textContent = message
    this.#message.focus()
  }

  /**
   * Calls the handler when the admin opens an order.
   *
   * @param {(number: string) => void} handler - Gets the order number.
   */
  onOpen(handler) {
    this.#orders.addEventListener('click', (event) => {
      const row = event.target.closest('button')?.closest('tr')

      if (row) {
        handler(row.dataset.number)
      }
    })
  }

  /**
   * Calls the handler when the admin clicks a status button of the open order.
   *
   * @param {(number: string, eventName: string) => void} handler - Gets the order number and the event, such as
   *   "pack".
   */
  onStatusChange(handler) {
    this.#statusButtons.addEventListener('click', (event) => {
      const button = event.target.closest('button')

      if (button) {
        handler(this.#openNumber, button.dataset.event)
      }
    })
  }

  /**
   * A row made from the order row template. The row keeps the order number for the Open button.
   *
   * @param {import('../../services/ApiClient.js').OrderSummary} order - One order.
   * @returns {HTMLTableRowElement} The new row.
   */
  #createOrderRow(order) {
    const row = this.#orderRowTemplate.content.firstElementChild.cloneNode(true)

    row.dataset.number = order.number
    row.querySelector('.order-number').textContent = order.number
    row.querySelector('.order-placed').textContent = order.createdAt.toLocaleString('en-GB', DATE_FORMAT)
    row.querySelector('.order-status').textContent = order.status
    row.querySelector('.order-total').textContent = `${order.total} kr`

    return row
  }

  /**
   * A row made from the line template.
   *
   * @param {{ name: string, price: number, quantity: number }} line - One tea in the order.
   * @returns {HTMLTableRowElement} The new row.
   */
  #createLineRow(line) {
    const row = this.#lineRowTemplate.content.firstElementChild.cloneNode(true)

    row.querySelector('.line-name').textContent = line.name
    row.querySelector('.line-quantity').textContent = line.quantity
    row.querySelector('.line-price').textContent = `${line.price} kr`

    return row
  }

  /**
   * Cancel gets Bootstrap's red outline, and the events that move the order forward the shop's green.
   *
   * @param {string} eventName - Such as "pack".
   * @returns {HTMLButtonElement} The new button.
   */
  #createStatusButton(eventName) {
    const button = document.createElement('button')

    button.type = 'button'
    button.className = eventName === CANCEL ? 'btn btn-sm btn-outline-danger' : 'btn btn-sm btn-primary'
    button.dataset.event = eventName
    button.textContent = eventName

    return button
  }

  /**
   * The text is set with textContent, so customer details are never read as HTML.
   *
   * @param {string} selector - Such as "#order-number".
   * @param {string} text - What to show.
   */
  #setText(selector, text) {
    this.shadowRoot.querySelector(selector).textContent = text
  }
}
