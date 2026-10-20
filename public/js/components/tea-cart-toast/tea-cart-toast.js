import { TeaElement } from '../TeaElement.js'
import { htmlTemplate } from './tea-cart-toast.html.js'

/**
 * A message in the corner about the cart. It stays until the customer closes it.
 */
export class TeaCartToast extends TeaElement {
  #toast
  /** @type {HTMLElement | null} The element that had focus when the message was shown. */
  #focusBefore = null

  /**
   * Builds the message in a shadow root, and hides it when its close button is clicked.
   */
  constructor() {
    super(htmlTemplate)

    this.#toast = this.shadowRoot.querySelector('#cart-toast')
    this.#toast.querySelector('.btn-close').addEventListener('click', () => this.#hide())
  }

  /**
   * Shows the message, or replaces the one shown.
   *
   * @param {string} message - Such as "Earl Grey in cart: 2".
   */
  show(message) {
    this.#focusBefore = this.#findFocusedElement()
    this.#toast.querySelector('.toast-body').textContent = message
    this.#toast.classList.add('show')
  }

  /**
   * Focus would otherwise fall back to the start of the page.
   */
  #hide() {
    this.#toast.classList.remove('show')
    this.#focusBefore?.focus()
  }

  /**
   * The page only sees the component that has focus, so the search goes on inside its shadow root.
   *
   * @returns {HTMLElement | null} The focused element, such as a tea in the product list.
   */
  #findFocusedElement() {
    let focused = document.activeElement

    while (focused?.shadowRoot?.activeElement) {
      focused = focused.shadowRoot.activeElement
    }

    return focused
  }
}
