import { cssTemplate } from './shop.css.js'

/**
 * A shop component: its markup in a shadow root with the shop's stylesheets. It stays hidden until the stylesheets
 * have loaded, so that Furni's transitions do not fade it in.
 */
export class TeaElement extends HTMLElement {
  #stylesheetsLoaded

  /**
   * Builds the shadow root from the shop's stylesheets and the component's markup.
   *
   * @param {HTMLTemplateElement} htmlTemplate - The component's markup.
   */
  constructor(htmlTemplate) {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(cssTemplate.content.cloneNode(true))
    this.shadowRoot.appendChild(htmlTemplate.content.cloneNode(true))
    this.#stylesheetsLoaded = this.#waitForStylesheets()
  }

  /**
   * Hides the component until its stylesheets have loaded.
   */
  async connectedCallback() {
    this.hidden = true
    await this.#stylesheetsLoaded
    this.hidden = false
  }

  /**
   * A stylesheet that fails to load counts as done, so the component is shown anyway.
   *
   * @returns {Promise<Event[]>} Settles when every stylesheet has loaded or failed.
   */
  #waitForStylesheets() {
    const links = [...this.shadowRoot.querySelectorAll('link')]
    const loads = links.map(
      (link) =>
        new Promise((resolve) => {
          link.addEventListener('load', resolve, { once: true })
          link.addEventListener('error', resolve, { once: true })
        })
    )

    return Promise.all(loads)
  }
}
