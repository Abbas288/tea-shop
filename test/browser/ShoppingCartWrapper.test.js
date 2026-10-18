import { describe, expect, it } from 'vitest'
import { ShoppingCartWrapper } from '../../public/js/model/ShoppingCartWrapper.js'
import { Product } from '../../public/js/model/Product.js'
import { QuantityError } from '../../public/js/model/QuantityError.js'

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
  it('adds up the bags and what they cost', () => {
    const cart = new ShoppingCartWrapper()

    cart.add(rooibos, 1)
    cart.add(earlGrey, 1)
    cart.add(earlGrey, 1)

    expect(linesOf(cart)).toEqual([
      ['Rooibos', 1, 69],
      ['Earl Grey', 2, 158],
    ])
    expect([cart.subtotal, cart.total, cart.bagCount]).toEqual([227, 227, 3])
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

  it.each([0, 1.5, '2'])('refuses the quantity %j', (quantity) => {
    const cart = new ShoppingCartWrapper()

    cart.add(earlGrey, 1)

    expect(() => cart.add(rooibos, quantity)).toThrow(new QuantityError())
    expect(() => cart.changeQuantity('Earl Grey', quantity)).toThrow(new QuantityError())
    expect(linesOf(cart)).toEqual([['Earl Grey', 1, 79]])
  })
})
