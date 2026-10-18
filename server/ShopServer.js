import express from 'express'

/**
 * The web server of the shop. It serves the pages in the public folder, with the shop as the start page.
 * A page can be asked for without .html, such as /cart.
 */
export class ShopServer {
  #app = express()

  /**
   * Nothing is served before listen is called, except through requestHandler.
   *
   * @param {string} publicFolder - The folder with the pages.
   */
  constructor(publicFolder) {
    this.#app.use(express.static(publicFolder, { index: 'shop.html', extensions: ['html'] }))
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
