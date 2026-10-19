import { describe, expect, it } from 'vitest'
import { Product } from '../src/models/Product.js'
import { ProductCatalog } from '../src/models/ProductCatalog.js'

/**
 * A product with the name, and the same values otherwise.
 *
 * @param {string} name - Such as "Rooibos".
 * @returns {Product} The product.
 */
const productNamed = (name) => new Product({ name, description: 'A tea.', price: 69, image: '/images/tea.webp' })

describe('ProductCatalog', () => {
  it('lists the products in the order they were given', () => {
    const catalog = new ProductCatalog([productNamed('Rooibos'), productNamed('Earl Grey')])

    expect(catalog.listProducts().map((product) => product.name)).toEqual(['Rooibos', 'Earl Grey'])
  })

  it('hands out a new list, so a caller cannot change the catalog', () => {
    const catalog = new ProductCatalog([productNamed('Rooibos')])

    catalog.listProducts().pop()

    expect(catalog.listProducts()).toHaveLength(1)
  })

  it('refuses two products with the same name', () => {
    expect(() => new ProductCatalog([productNamed('Rooibos'), productNamed('Rooibos')])).toThrow(
      new Error('Two products are named "Rooibos".')
    )
  })

  it('refuses an item that is not a product', () => {
    const notAProduct = { name: 'Rooibos', description: 'A tea.', price: 69, image: '/images/tea.webp' }

    expect(() => new ProductCatalog([notAProduct])).toThrow(new TypeError('A catalog only holds products.'))
  })

  it('refuses an empty list', () => {
    expect(() => new ProductCatalog([])).toThrow(new RangeError('A catalog needs at least one product.'))
  })

  it('refuses something that is not a list', () => {
    expect(() => new ProductCatalog(productNamed('Rooibos'))).toThrow(
      new TypeError('A catalog needs a list of products.')
    )
  })
})
