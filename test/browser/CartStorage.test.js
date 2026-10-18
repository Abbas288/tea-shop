import { describe, expect, it } from 'vitest'
import { ShoppingCartWrapper } from '../../public/js/model/ShoppingCartWrapper.js'
import { CartStorage } from '../../public/js/model/CartStorage.js'
import { Product } from '../../public/js/model/Product.js'

const earlGrey = new Product({ name: 'Earl Grey', description: 'Black tea.', price: 79, image: '/earl-grey.webp' })
const rooibos = new Product({ name: 'Rooibos', description: 'Red bush tea.', price: 69, image: '/rooibos.webp' })
const products = [earlGrey, rooibos]

/**
 * A Storage that keeps its values in memory, in place of localStorage.
 *
 * @param {string} [savedText] - What is saved under the cart's key, if anything.
 * @returns {Pick<Storage, 'getItem' | 'setItem'>} The storage.
 */
const memoryStorage = (savedText) => {
  const values = new Map()

  if (savedText !== undefined) {
    values.set('tea-shop-cart', savedText)
  }

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

/**
 * The lines of the cart as [name, bags] for each tea.
 *
 * @param {ShoppingCartWrapper} cart - The cart to read.
 * @returns {Array<[string, number]>} One entry per line.
 */
const linesOf = (cart) => cart.listLines().map((line) => [line.product.name, line.quantity])

describe('CartStorage', () => {
  it('loads an empty cart on the first visit', () => {
    expect(new CartStorage(memoryStorage()).load(products).isEmpty).toBe(true)
  })

  it('loads the cart it saved, in a later visit', () => {
    const storage = memoryStorage()
    const cart = new ShoppingCartWrapper()

    cart.add(rooibos, 1)
    cart.add(earlGrey, 2)
    new CartStorage(storage).save(cart)

    expect(linesOf(new CartStorage(storage).load(products))).toEqual([
      ['Rooibos', 1],
      ['Earl Grey', 2],
    ])
  })

  it('takes the prices from the shop, not from the saved cart', () => {
    const storage = memoryStorage('[{"name":"Earl Grey","quantity":2,"price":1}]')

    expect(new CartStorage(storage).load(products).subtotal).toBe(158)
  })

  it('leaves out a line it cannot use', () => {
    const savedText = JSON.stringify([
      { name: 'Mint', quantity: 1 },
      null,
      { name: 'Rooibos' },
      { name: 'Rooibos', quantity: '2' },
      { name: 'Earl Grey', quantity: 1 },
    ])

    expect(linesOf(new CartStorage(memoryStorage(savedText)).load(products))).toEqual([['Earl Grey', 1]])
  })

  it.each(['not JSON', '42'])('loads an empty cart when the saved text is %j', (savedText) => {
    expect(new CartStorage(memoryStorage(savedText)).load(products).isEmpty).toBe(true)
  })
})
