import express from 'express'

/**
 * The web server of the shop, and its only part that knows HTTP. It serves the pages in the public folder,
 * with the shop as the start page, and turns each API request into a call to the controller and its result
 * into an answer. A page can be asked for without .html, such as /cart.
 */
export class ShopServer {
  #app = express()

  /**
   * Nothing is served before listen is called, except through requestHandler.
   *
   * @param {string} publicFolder - The folder with the pages.
   * @param {import('./controller/ShopController.js').ShopController} shopController - The customer's use cases.
   */
  constructor(publicFolder, shopController) {
    this.#app.use(express.static(publicFolder, { index: 'shop.html', extensions: ['html'] }))
    this.#app.get('/api/products', (_request, response) => response.json(shopController.listProducts()))
  }

  /**
   * Lets a test send requests without a running server.
   *
   * @returns {import('express').Express} The Express app.
   */
  get requestHandler() {
    return this.#app
  }

  /**
   * Starts the server.
   *
   * @param {number} port - Such as 3000.
   * @returns {Promise<import('node:http').Server>} The running server.
   */
  listen(port) {
    return new Promise((resolve, reject) => {
      const server = this.#app.listen(port, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve(server)
        }
      })
    })
  }
}
