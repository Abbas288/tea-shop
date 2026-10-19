import { describe, expect, it } from 'vitest'
import { Product } from '../src/models/Product.js'

const earlGrey = {
  name: 'Earl Grey',
  description: 'Black tea with bergamot.',
  price: 79,
  image: '/images/teas/earl-grey.webp',
}

describe('Product', () => {
  it('is sent to the browser as a plain object', () => {
    const product = new Product(earlGrey)

    expect(JSON.parse(JSON.stringify(product))).toEqual(earlGrey)
  })

  it('refuses a price written as text', () => {
    const createProduct = () => new Product({ ...earlGrey, price: '79' })

    expect(createProduct).toThrow(TypeError)
    expect(createProduct).toThrow('price')
  })

  it.each([0, 79.5])('refuses the price %j, which is not a positive integer', (price) => {
    const createProduct = () => new Product({ ...earlGrey, price })

    expect(createProduct).toThrow(RangeError)
    expect(createProduct).toThrow('price')
  })
})
