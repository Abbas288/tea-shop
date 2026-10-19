import { describe, expect, it } from 'vitest'
import { Product } from '../../public/js/model/Product.js'
import { QuantityError } from '../../public/js/model/QuantityError.js'
import { ShoppingCartWrapper } from '../../public/js/model/ShoppingCartWrapper.js'

const earlGrey = new Product({ name: 'Earl Grey', description: 'Black tea.', price: 79, image: '/earl-grey.webp' })
const rooibos = new Product({ name: 'Rooibos', description: 'Red bush tea.', price: 69, image: '/rooibos.webp' })

/**
 * The lines of the cart as [name, bags, total] for each tea.
 *
 * @param {ShoppingCartWrapper} cart - The cart to read.
 * @returns {Array<[string, number, number]>} One entry per line.
 */
const linesOf = (cart) => cart.listLines().map((line) => [line.product.name, line.quantity, line.total])

describe('ShoppingCartWrapper', () => {
  it('gives a tea added twice one line, with the bags added up', () => {
    const cart = new ShoppingCartWrapper()

    cart.add(rooibos, 1)
    cart.add(earlGrey, 1)
    cart.add(earlGrey, 1)

    expect(linesOf(cart)).toEqual([
      ['Rooibos', 1, 69],
      ['Earl Grey', 2, 158],
    ])
  })

  it('adds up the subtotal and the bags of all teas', () => {
    const cart = new ShoppingCartWrapper()

    cart.add(rooibos, 1)
    cart.add(earlGrey, 2)

    expect([cart.subtotal, cart.bagCount]).toEqual([227, 3])
  })

  it('changes the bags of a tea', () => {
    const cart = new ShoppingCartWrapper()

    cart.add(earlGrey, 1)
    cart.changeQuantity('Earl Grey', 3)

    expect(linesOf(cart)).toEqual([['Earl Grey', 3, 237]])
  })

  it('removes a tea', () => {
    const cart = new ShoppingCartWrapper()

    cart.add(earlGrey, 1)
    cart.add(rooibos, 1)
    cart.remove('Earl Grey')

    expect(linesOf(cart)).toEqual([['Rooibos', 1, 69]])
  })

  it.each([0, 1.5, '2'])('refuses to add the quantity %j', (quantity) => {
    const cart = new ShoppingCartWrapper()

    expect(() => cart.add(rooibos, quantity)).toThrow(QuantityError)
    expect(cart.isEmpty).toBe(true)
  })

  it.each([0, '2'])('refuses to change the bags to %j', (quantity) => {
    const cart = new ShoppingCartWrapper()

    cart.add(earlGrey, 1)

    expect(() => cart.changeQuantity('Earl Grey', quantity)).toThrow(QuantityError)
    expect(linesOf(cart)).toEqual([['Earl Grey', 1, 79]])
  })

  it('throws instead of answering false for a tea that is not in the cart', () => {
    const cart = new ShoppingCartWrapper()

    expect(() => cart.changeQuantity('Rooibos', 2)).toThrow('not in the cart')
    expect(() => cart.remove('Rooibos')).toThrow('not in the cart')
  })
})
