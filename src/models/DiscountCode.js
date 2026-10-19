/**
 * A code that takes a percent off the cart.
 */
export class DiscountCode {
  #code
  #percent

  /**
   * Checks both values before the code is created.
   *
   * @param {object} details - The code.
   * @param {string} details.code - Such as "SAVE10", in capitals.
   * @param {number} details.percent - An integer from 1 to 100.
   * @throws {TypeError} If the code is not text in capitals and digits.
   * @throws {RangeError} If the percent is not an integer from 1 to 100.
   */
  constructor({ code, percent } = {}) {
    if (typeof code !== 'string' || !/^[A-Z0-9]+$/.test(code)) {
      throw new TypeError('A discount code must be capitals and digits.')
    }

    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      throw new RangeError('A discount must be an integer from 1 to 100 percent.')
    }

    this.#code = code
    this.#percent = percent
  }

  /**
   * Such as "SAVE10".
   *
   * @returns {string} The code in capitals.
   */
  get code() {
    return this.#code
  }

  /**
   * The shape sent to the browser. JSON.stringify calls it.
   *
   * @returns {{ code: string, percent: number }} A plain copy.
   */
  toJSON() {
    return { code: this.#code, percent: this.#percent }
  }
}
