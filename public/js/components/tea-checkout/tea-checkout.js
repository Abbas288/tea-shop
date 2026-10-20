import { TeaElement } from '../TeaElement.js'
import { htmlTemplate } from './tea-checkout.html.js'

/**
 * The checkout page's delivery form, the order with its sums and the button that places it. The browser checks the
 * form before the customer can send it.
 */
export class TeaCheckout extends TeaElement {
  #form
  #lines
  #template
  #subtotal
  #discountLabel
  #discount
  #total
  #message
  #placeOrderButton

  /**
   * Builds the form and the order in a shadow root.
   */
  constructor() {
    super(htmlTemplate)

    this.#form = this.shadowRoot.querySelector('#checkout-form')
    this.#lines = this.shadowRoot.querySelector('#order-lines')
    this.#template = this.shadowRoot.querySelector('#order-line-template')
    this.#subtotal = this.shadowRoot.querySelector('#order-subtotal')
    this.#discountLabel = this.shadowRoot.querySelector('#order-discount-label')
    this.#discount = this.shadowRoot.querySelector('#order-discount')
    this.#total = this.shadowRoot.querySelector('#order-total')
    this.#message = this.shadowRoot.querySelector('#checkout-message')
    this.#placeOrderButton = this.#form.querySelector('button[type="submit"]')
  }

  /**
   * Shows every tea and the sums, and lets the customer place the order.
   *
   * @param {import('../../model/ShoppingCartWrapper.js').ShoppingCartWrapper} cart - The cart to order.
   */
  showOrder(cart) {
    const rows = cart.listLines().map((line) => this.#createRow(line))

    this.#lines.replaceChildren(...rows)
    this.#subtotal.textContent = `${cart.subtotal} kr`
    this.#discountLabel.textContent = cart.discountCode === '' ? 'Discount' : `Discount (${cart.discountCode})`
    this.#discount.textContent = cart.discount === 0 ? '0 kr' : `−${cart.discount} kr`
    this.#total.textContent = `${cart.total} kr`
    this.#message.textContent = ''
    this.#placeOrderButton.disabled = false
  }

  /**
   * Shows why there is nothing to order. The button stays disabled.
   *
   * @param {string} message - Such as "Your cart is empty."
   */
  showCannotOrder(message) {
    this.#message.textContent = message
    this.#placeOrderButton.disabled = true
  }

  /**
   * Disables the button while the order is sent, so it is not placed twice.
   */
  showPlacingOrder() {
    this.#message.textContent = 'Placing your order...'
    this.#placeOrderButton.disabled = true
  }

  /**
   * Shows why the order was not placed and lets the customer try again. Focus moves to the message.
   *
   * @param {string} message - Such as "Enter a valid email address."
   */
  showOrderRefused(message) {
    this.#message.textContent = message
    this.#placeOrderButton.disabled = false
    this.#message.focus()
  }

  /**
   * Opens the thank-you page for the order.
   *
   * @param {{ number: string, token: string }} receipt - The order number and the token for the tracking link.
   */
  goToReceipt({ number, token }) {
    const receiptParameters = new URLSearchParams({ number, token })

    window.location.assign(`thankyou?${receiptParameters}`)
  }

  /**
   * Calls the handler when the customer sends a valid form. The page does not reload.
   *
   * @param {(customer: { name: string, email: string, street: string, postalCode: string, city: string }) => void}
   *   handler - Gets the values of the form.
   */
  onPlaceOrder(handler) {
    this.#form.addEventListener('submit', (event) => {
      event.preventDefault()
      handler(Object.fromEntries(new FormData(this.#form)))
    })
  }

  /**
   * A row made from the line template.
   *
   * @param {import('../../model/CartLine.js').CartLine} line - One tea in the cart.
   * @returns {HTMLTableRowElement} The new row.
   */
  #createRow(line) {
    const row = this.#template.content.firstElementChild.cloneNode(true)

    row.querySelector('.line-name').textContent = line.product.name
    row.querySelector('.line-quantity').textContent = line.quantity
    row.querySelector('.line-total').textContent = `${line.total} kr`

    return row
  }
}
