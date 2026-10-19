/**
 * The browser's localStorage, looked up at each call. A browser that blocks site data then throws when the cart is
 * read or saved, not when the page starts.
 */
export class BrowserStorage {
  /**
   * Same as localStorage.getItem.
   *
   * @param {string} key - The name the value is saved under.
   * @returns {string | null} The value, or null if nothing is saved.
   */
  getItem(key) {
    return localStorage.getItem(key)
  }

  /**
   * Same as localStorage.setItem.
   *
   * @param {string} key - The name to save the value under.
   * @param {string} value - The text to save.
   */
  setItem(key, value) {
    localStorage.setItem(key, value)
  }

  /**
   * Same as localStorage.removeItem.
   *
   * @param {string} key - The name the value is saved under.
   */
  removeItem(key) {
    localStorage.removeItem(key)
  }
}
