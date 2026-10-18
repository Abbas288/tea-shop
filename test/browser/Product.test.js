import { describe, expect, it } from 'vitest'
import { Product } from '../../public/js/Product.js'

const rooibos = { name: 'Rooibos', description: 'Red bush tea.', price: 69, image: '/images/teas/rooibos.webp' }

describe('Product in the browser', () => {
  it('keeps the values from the API', () => {
    const product = new Product(rooibos)

    expect([product.name, product.description, product.price, product.image]).toEqual([
      'Rooibos',
      'Red bush tea.',
      69,
      '/images/teas/rooibos.webp',
    ])
  })

  it.each(['name', 'description', 'image'])('refuses a missing %s', (field) => {
    expect(() => new Product({ ...rooibos, [field]: undefined })).toThrow(new TypeError(`A product needs a ${field}.`))
  })

  it.each([undefined, '69', 0, 69.5])('refuses the price %j', (price) => {
    expect(() => new Product({ ...rooibos, price })).toThrow(new TypeError('A product needs a price in whole kronor.'))
  })
})
