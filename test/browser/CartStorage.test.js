import { describe, expect, it } from 'vitest'
import { BrowserStorage } from '../../public/js/services/BrowserStorage.js'
import { CartStorage } from '../../public/js/services/CartStorage.js'
import { CartStorageError } from '../../public/js/services/CartStorageError.js'
import { Product } from '../../public/js/model/Product.js'
import { ShoppingCartWrapper } from '../../public/js/model/ShoppingCartWrapper.js'

const earlGrey = new Product({ name: 'Earl Grey', description: 'Black tea.', price: 79, image: '/earl-grey.webp' })
const rooibos = new Product({ name: 'Rooibos', description: 'Red bush tea.', price: 69, image: '/rooibos.webp' })
const products = [earlGrey, rooibos]

/**
 * A Storage that keeps what is saved in memory, in place of localStorage.
 *
 * @returns {Pick<Storage, 'getItem' | 'setItem'>} An empty storage.
 */
const memoryStorage = () => {
  const values = new Map()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

/**
 * A Storage that answers with the same text whatever key is asked for.
 *
 * @param {string | null} savedText - What the browser holds, or null for nothing.
 * @returns {Pick<Storage, 'getItem' | 'setItem'>} The storage.
 */
const storageHolding = (savedText) => ({ getItem: () => savedText, setItem: () => {} })

/**
 * The bags of each tea in the cart, as [name, bags].
 *
 * @param {ShoppingCartWrapper} cart - The cart to read.
 * @returns {Array<[string, number]>} One entry per tea.
 */
const bagsPerTea = (cart) => cart.listLines().map((line) => [line.product.name, line.quantity])

describe('CartStorage', () => {
  it('loads an empty cart on the first visit', () => {
    expect(new CartStorage(storageHolding(null)).load(products).isEmpty).toBe(true)
  })

  it('loads the cart it saved, in a later visit', () => {
    const storage = memoryStorage()
    const cart = new ShoppingCartWrapper()

    cart.add(rooibos, 1)
    cart.add(earlGrey, 2)
    new CartStorage(storage).save(cart)

    expect(bagsPerTea(new CartStorage(storage).load(products))).toEqual([
      ['Rooibos', 1],
      ['Earl Grey', 2],
    ])
  })

  it('keeps the discount code between visits', () => {
    const storage = memoryStorage()
    const cart = new ShoppingCartWrapper()

    cart.add(earlGrey, 2)
    cart.applyDiscount('SAVE10', 10)
    new CartStorage(storage).save(cart)

    const loaded = new CartStorage(storage).load(products)

    expect([loaded.discountCode, loaded.total]).toEqual(['SAVE10', 142])
  })

  it('takes the prices from the shop, not from the saved cart', () => {
    const storage = storageHolding('[{"name":"Earl Grey","quantity":2,"price":1}]')

    expect(new CartStorage(storage).load(products).subtotal).toBe(158)
  })

  it('leaves out a line it cannot use', () => {
    const savedText = JSON.stringify([
      { name: 'Mint', quantity: 1 },
      null,
      { name: 'Rooibos' },
      { name: 'Rooibos', quantity: '2' },
      { name: 'Rooibos', quantity: 100 },
      { name: 'Earl Grey', quantity: 1 },
    ])

    expect(bagsPerTea(new CartStorage(storageHolding(savedText)).load(products))).toEqual([['Earl Grey', 1]])
  })

  it('keeps valid lines without a saved discount it cannot use', () => {
    const savedText = JSON.stringify({
      lines: [{ name: 'Earl Grey', quantity: 2 }],
      discount: { code: 'SAVE10', percent: '10' },
    })

    const cart = new CartStorage(storageHolding(savedText)).load(products)

    expect(bagsPerTea(cart)).toEqual([['Earl Grey', 2]])
    expect([cart.discountCode, cart.discount, cart.total]).toEqual(['', 0, 158])
  })

  it('turns a browser that blocks localStorage into a CartStorageError', () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get: () => {
        throw new DOMException('Access is denied.', 'SecurityError')
      },
    })

    try {
      expect(() => new CartStorage(new BrowserStorage()).load(products)).toThrow(CartStorageError)
    } finally {
      if (originalDescriptor === undefined) {
        delete globalThis.localStorage
      } else {
        Object.defineProperty(globalThis, 'localStorage', originalDescriptor)
      }
    }
  })

  it.each(['not JSON', '42'])('loads an empty cart when the saved text is %j', (savedText) => {
    expect(new CartStorage(storageHolding(savedText)).load(products).isEmpty).toBe(true)
  })
})
