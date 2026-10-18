/**
 * Shows the teas on the shop page. Each tea is a copy of the product template in the page, with Furni's
 * markup. Text is set with textContent and is never read as HTML.
 */
export class ProductList {
  #list
  #template

  /**
   * Shows nothing until show is called.
   *
   * @param {HTMLElement} list - The row the products go in.
   * @param {HTMLTemplateElement} template - The markup of one product.
   */
  constructor(list, template) {
    this.#list = list
    this.#template = template
  }

  /**
   * Replaces what the list showed before.
   *
   * @param {import('./Product.js').Product[]} products - In the order to show them.
   */
  show(products) {
    const items = products.map((product) => this.#createItem(product))

    this.#list.replaceChildren(...items)
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
   * @param {import('./Product.js').Product} product - One tea.
   * @returns {Element} The column with the product.
   */
  #createItem(product) {
    const item = this.#template.content.firstElementChild.cloneNode(true)
    const image = item.querySelector('.product-thumbnail')

    image.src = product.image
    image.alt = product.name
    item.querySelector('.product-title').textContent = product.name
    item.querySelector('.product-description').textContent = product.description
    item.querySelector('.product-price').textContent = `${product.price} kr`

    return item
  }
}
