import { TeaElement } from '../TeaElement.js'
import { htmlTemplate } from './tea-product-list.html.js'

/**
 * The teas on the shop page, one copy of the product template per tea. Text is never read as HTML.
 */
export class TeaProductList extends TeaElement {
  #list
  #template

  /**
   * Builds the product section in a shadow root.
   */
  constructor() {
    super(htmlTemplate)

    this.#list = this.shadowRoot.querySelector('#products')
    this.#template = this.shadowRoot.querySelector('#product-template')
  }

  /**
   * Replaces what the list showed before.
   *
   * @param {import('../../model/Product.js').Product[]} products - In the order to show them.
   */
  show(products) {
    const items = products.map((product) => this.#createItem(product))

    this.#list.replaceChildren(...items)
  }

  /**
   * Calls the handler with the tea's name when the customer picks a tea.
   *
   * @param {(productName: string) => void} handler - Gets a name such as "Earl Grey".
   */
  onAddToCart(handler) {
    this.#list.addEventListener('click', (event) => {
      const item = event.target.closest('.product-item')

      if (item !== null) {
        handler(item.dataset.productName)
      }
    })
  }

  /**
   * Replaces the list with the message.
   *
   * @param {string} message - Such as "The teas could not be loaded."
   */
  showError(message) {
    const text = document.createElement('p')

    text.className = 'col-12 text-center'
    text.textContent = message
    this.#list.replaceChildren(text)
  }

  /**
   * A copy of the template with the tea's values.
   *
   * @param {import('../../model/Product.js').Product} product - One tea.
   * @returns {Element} The column with the product.
   */
  #createItem(product) {
    const item = this.#template.content.firstElementChild.cloneNode(true)

    item.querySelector('.product-item').dataset.productName = product.name
    item.querySelector('.product-thumbnail').src = product.image
    item.querySelector('.product-title').textContent = product.name
    item.querySelector('.product-description').textContent = product.description
    item.querySelector('.product-price').textContent = `${product.price} kr`

    return item
  }
}
