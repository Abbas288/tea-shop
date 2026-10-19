import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import productDetails from '../src/data/products.json' with { type: 'json' }
import { Product } from '../src/models/Product.js'
import { ProductCatalog } from '../src/models/ProductCatalog.js'

describe('The teas in products.json', () => {
  const catalog = new ProductCatalog(productDetails.map((details) => new Product(details)))

  it('are four valid products with unique names', () => {
    expect(catalog.listProducts()).toHaveLength(4)
  })

  it('each have a picture that the server serves', async () => {
    for (const product of catalog.listProducts()) {
      const picture = product.toJSON().image
      const response = await request(app).get(picture)

      expect(response.status, picture).toBe(200)
      expect(response.type, picture).toBe('image/webp')
    }
  })
})
