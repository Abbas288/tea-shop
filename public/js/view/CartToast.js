/**
 * A message in the corner about the cart. It stays until the customer closes it.
 */
export class CartToast {
  #toast
  /** @type {HTMLElement | null} The element that had focus when the message was shown. */
  #focusBefore = null

  /**
   * Hides the message when its close button is clicked, and gives focus back.
   *
   * @param {HTMLElement} toast - Bootstrap's toast markup, inside an aria-live container.
   */
  constructor(toast) {
    this.#toast = toast
    this.#toast.querySelector('.btn-close').addEventListener('click', () => this.#hide())
  }

  /**
   * Shows the message, or replaces the one shown.
   *
   * @param {string} message - Such as "Added Earl Grey. Bags in your cart: 2."
   */
  show(message) {
    this.#focusBefore = document.activeElement
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
}
