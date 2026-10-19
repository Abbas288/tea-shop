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
  it('refuses two products with the same name', () => {
    expect(() => new ProductCatalog([productNamed('Rooibos'), productNamed('Rooibos')])).toThrow('Rooibos')
  })
})
