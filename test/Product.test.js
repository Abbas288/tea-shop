import { describe, expect, it } from 'vitest'
import { Product } from '../server/model/Product.js'

const earlGrey = {
  name: 'Earl Grey',
  description: 'Black tea with bergamot.',
  price: 79,
  image: '/images/teas/earl-grey.webp',
}

describe('Product', () => {
  it('keeps its name, description, price and picture', () => {
    const product = new Product(earlGrey)

    expect(product.name).toBe('Earl Grey')
    expect(product.toJSON()).toEqual(earlGrey)
  })

  it('is sent to the browser as a plain object', () => {
    const product = new Product(earlGrey)

    expect(JSON.parse(JSON.stringify(product))).toEqual(earlGrey)
  })

  it.each(['name', 'description', 'image'])('refuses a missing, empty or non-text %s', (field) => {
    const message = `A product needs a ${field}.`

    expect(() => new Product({ ...earlGrey, [field]: undefined })).toThrow(new TypeError(message))
    expect(() => new Product({ ...earlGrey, [field]: '   ' })).toThrow(new TypeError(message))
    expect(() => new Product({ ...earlGrey, [field]: 42 })).toThrow(new TypeError(message))
  })

  it.each([' Earl Grey', 'Earl Grey '])('refuses the name %j with a space at the start or end', (name) => {
    expect(() => new Product({ ...earlGrey, name })).toThrow(
      new TypeError('A product name cannot start or end with a space.')
    )
  })

  it.each([undefined, '79'])('refuses the price %j, which is not a number', (price) => {
    expect(() => new Product({ ...earlGrey, price })).toThrow(new TypeError('A product needs a price.'))
  })

  it.each([0, -5, 79.5, Number.NaN])('refuses the price %j, which is not a positive integer', (price) => {
    expect(() => new Product({ ...earlGrey, price })).toThrow(new RangeError('A price must be a positive integer.'))
  })

  it('refuses to be created without details', () => {
    expect(() => new Product()).toThrow(new TypeError('A product needs a name.'))
  })
})
