import { TeaElement } from '../TeaElement.js'
import { htmlTemplate } from './tea-cart.html.js'

/**
 * The cart page's teas, discount code and sums. Each tea is a row made from the line template. A row is updated in
 * place, and focus stays on the button the customer used.
 */
export class TeaCart extends TeaElement {
  #lines
  #template
  #message
  #subtotal
  #discountLabel
  #discount
  #total
  #discountForm
  #discountMessage
  #checkoutLink
  /** @type {Map<string, HTMLTableRowElement>} The rows on the page, by tea name. */
  #rows = new Map()

  /**
   * Builds the cart in a shadow root.
   */
  constructor() {
    super(htmlTemplate)

    this.#lines = this.shadowRoot.querySelector('#cart-lines')
    this.#template = this.shadowRoot.querySelector('#cart-line-template')
    this.#message = this.shadowRoot.querySelector('#cart-message')
    this.#subtotal = this.shadowRoot.querySelector('#cart-subtotal')
    this.#discountLabel = this.shadowRoot.querySelector('#cart-discount-label')
    this.#discount = this.shadowRoot.querySelector('#cart-discount')
    this.#total = this.shadowRoot.querySelector('#cart-total')
    this.#discountForm = this.shadowRoot.querySelector('#discount-form')
    this.#discountMessage = this.shadowRoot.querySelector('#discount-message')
    this.#checkoutLink = this.shadowRoot.querySelector('#checkout-link')
    this.#message.tabIndex = -1
  }

  /**
   * Shows every tea in the cart and the sums. An empty cart gets a message and no way to checkout.
   *
   * @param {import('../../model/ShoppingCartWrapper.js').ShoppingCartWrapper} cart - The cart to show.
   */
  show(cart) {
    const lines = cart.listLines()
    const namesInCart = new Set(lines.map((line) => line.product.name))

    for (const [name, row] of this.#rows) {
      if (!namesInCart.has(name)) {
        this.#removeRow(name, row)
      }
    }

    for (const line of lines) {
      const row = this.#rows.get(line.product.name) ?? this.#addRow(line.product)

      this.#fillRow(row, line, cart)
    }

    this.#subtotal.textContent = `${cart.subtotal} kr`
    this.#discountLabel.textContent = cart.discountCode === '' ? 'Discount' : `Discount (${cart.discountCode})`
    this.#discount.textContent = cart.discount === 0 ? '0 kr' : `−${cart.discount} kr`
    this.#total.textContent = `${cart.total} kr`
    this.#message.textContent = cart.isEmpty ? 'Your cart is empty.' : ''
    this.#setCheckoutAllowed(!cart.isEmpty)
  }

  /**
   * Shows a message above the cart until the cart is shown again.
   *
   * @param {string} message - Such as "A tea can have 1 to 99 bags."
   */
  showMessage(message) {
    this.#message.textContent = message
  }

  /**
   * Shows a message under the discount code field.
   *
   * @param {string} message - Such as "Unknown discount code."
   */
  showDiscountMessage(message) {
    this.#discountMessage.textContent = message
  }

  /**
   * Calls the handler when the customer sends a discount code. The page does not reload.
   *
   * @param {(text: string) => void} handler - Gets what the customer typed.
   */
  onApplyDiscount(handler) {
    this.#discountForm.addEventListener('submit', (event) => {
      event.preventDefault()
      handler(this.#discountForm.elements.code.value)
    })
  }

  /**
   * Calls the handler when the customer uses the minus or plus button.
   *
   * @param {(productName: string, step: number) => void} handler - Gets the tea and the change in bags.
   */
  onAdjustQuantity(handler) {
    this.#lines.addEventListener('click', (event) => {
      const button = event.target.closest('.decrease, .increase')

      if (button !== null && button.getAttribute('aria-disabled') !== 'true') {
        const row = button.closest('tr')
        const step = button.classList.contains('increase') ? 1 : -1

        handler(row.dataset.productName, step)
      }
    })
  }

  /**
   * Calls the handler when the customer types a number of bags.
   *
   * @param {(productName: string, quantity: number) => void} handler - Gets the tea and the new number of bags.
   */
  onChangeQuantity(handler) {
    this.#lines.addEventListener('change', (event) => {
      if (event.target.matches('.quantity-amount')) {
        handler(event.target.closest('tr').dataset.productName, this.#readQuantity(event.target))
      }
    })
  }

  /**
   * Calls the handler when the customer removes a tea.
   *
   * @param {(productName: string) => void} handler - Gets the tea.
   */
  onRemove(handler) {
    this.#lines.addEventListener('click', (event) => {
      const button = event.target.closest('.remove')

      if (button !== null) {
        handler(button.closest('tr').dataset.productName)
      }
    })
  }

  /**
   * A copy of the line template with what does not change, such as the name and the price.
   *
   * @param {import('../../model/Product.js').Product} product - The tea.
   * @returns {HTMLTableRowElement} The new row, already on the page.
   */
  #addRow(product) {
    const row = this.#template.content.firstElementChild.cloneNode(true)

    row.dataset.productName = product.name
    row.querySelector('.line-image').src = product.image
    row.querySelector('.line-name').textContent = product.name
    row.querySelector('.line-price').textContent = `${product.price} kr`
    row.querySelector('.decrease').setAttribute('aria-label', `One less ${product.name}`)
    row.querySelector('.increase').setAttribute('aria-label', `One more ${product.name}`)
    row.querySelector('.quantity-amount').setAttribute('aria-label', `Bags of ${product.name}`)
    row.querySelector('.remove').setAttribute('aria-label', `Remove ${product.name}`)
    this.#lines.append(row)
    this.#rows.set(product.name, row)

    return row
  }

  /**
   * The buttons at the limits stay focusable, so focus is not lost when the customer reaches one.
   *
   * @param {HTMLTableRowElement} row - The row to fill.
   * @param {import('../../model/CartLine.js').CartLine} line - The tea's bags and total.
   * @param {import('../../model/ShoppingCartWrapper.js').ShoppingCartWrapper} cart - Says which buttons are allowed.
   */
  #fillRow(row, line, cart) {
    const productName = line.product.name

    row.querySelector('.quantity-amount').value = line.quantity
    row.querySelector('.line-total').textContent = `${line.total} kr`
    this.#setButtonAllowed(row.querySelector('.decrease'), cart.canRemoveBagOf(productName))
    this.#setButtonAllowed(row.querySelector('.increase'), cart.canAddBagOf(productName))
  }

  /**
   * Focus moves to the next row, or to the message, if the removed row had it. The page only sees the cart as
   * focused, so the shadow root says which button is.
   *
   * @param {string} name - The tea of the row.
   * @param {HTMLTableRowElement} row - The row to remove.
   */
  #removeRow(name, row) {
    const hadFocus = row.contains(this.shadowRoot.activeElement)
    const neighbour = row.nextElementSibling ?? row.previousElementSibling

    row.remove()
    this.#rows.delete(name)

    if (hadFocus) {
      const nextFocus = neighbour?.querySelector('.remove') ?? this.#message

      nextFocus.focus()
    }
  }

  /**
   * Only digits count. Text such as 0x10 or 1e1 is not read as a number.
   *
   * @param {HTMLInputElement} input - The quantity field.
   * @returns {number} The number typed, or NaN.
   */
  #readQuantity(input) {
    const text = input.value.trim()

    return /^\d+$/.test(text) ? Number(text) : Number.NaN
  }

  /**
   * Looks disabled but keeps focus.
   *
   * @param {HTMLButtonElement} button - The minus or plus button.
   * @param {boolean} allowed - Whether the button may be used.
   */
  #setButtonAllowed(button, allowed) {
    button.classList.toggle('disabled', !allowed)
    button.setAttribute('aria-disabled', String(!allowed))
  }

  /**
   * A link has no disabled state. It leaves the tab order and is marked as disabled instead.
   *
   * @param {boolean} allowed - Whether the cart has teas.
   */
  #setCheckoutAllowed(allowed) {
    this.#checkoutLink.classList.toggle('disabled', !allowed)
    this.#checkoutLink.setAttribute('aria-disabled', String(!allowed))
    this.#checkoutLink.tabIndex = allowed ? 0 : -1
  }
}
