import { describe, expect, it } from 'vitest'
import { Product } from '../../public/js/model/Product.js'

const rooibos = { name: 'Rooibos', description: 'Red bush tea.', price: 69, image: '/images/teas/rooibos.webp' }

describe('Product in the browser', () => {
  it('refuses a tea without a name', () => {
    const createProduct = () => new Product({ ...rooibos, name: undefined })

    expect(createProduct).toThrow(TypeError)
    expect(createProduct).toThrow('name')
  })

  it.each([
    [undefined, TypeError],
    ['69', TypeError],
    [0, RangeError],
    [69.5, RangeError],
  ])('refuses the price %j', (price, ErrorClass) => {
    const createProduct = () => new Product({ ...rooibos, price })

    expect(createProduct).toThrow(ErrorClass)
    expect(createProduct).toThrow('price')
  })
})
