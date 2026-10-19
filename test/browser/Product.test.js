import { describe, expect, it } from 'vitest'
import { Product } from '../../public/js/model/Product.js'

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

  it('refuses a tea without a name', () => {
    const createProduct = () => new Product({ ...rooibos, name: undefined })

    expect(createProduct).toThrow(TypeError)
    expect(createProduct).toThrow('name')
  })

  it.each([undefined, '69', 0, 69.5])('refuses the price %j', (price) => {
    const createProduct = () => new Product({ ...rooibos, price })

    expect(createProduct).toThrow(TypeError)
    expect(createProduct).toThrow('price')
  })
})
