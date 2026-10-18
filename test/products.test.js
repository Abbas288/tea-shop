import { fileURLToPath } from 'node:url'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { ShopController } from '../server/controller/ShopController.js'
import { Product } from '../server/model/Product.js'
import { ProductCatalog } from '../server/model/ProductCatalog.js'
import productDetails from '../server/products.json' with { type: 'json' }
import { ShopServer } from '../server/ShopServer.js'

describe('The teas in products.json', () => {
  const catalog = new ProductCatalog(productDetails.map((details) => new Product(details)))

  it('are four valid products with unique names', () => {
    expect(catalog.listProducts()).toHaveLength(4)
  })

  it('each have a picture that the server serves', async () => {
    const publicFolder = fileURLToPath(new URL('../public', import.meta.url))
    const shopServer = new ShopServer(publicFolder, new ShopController(catalog))

    for (const product of catalog.listProducts()) {
      const picture = product.toJSON().image
      const response = await request(shopServer.requestHandler).get(picture)

      expect(response.status, picture).toBe(200)
      expect(response.type, picture).toBe('image/webp')
    }
  })
})
