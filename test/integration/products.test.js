import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ApiClient } from '../../public/js/model/ApiClient.js'
import { ShopController } from '../../server/controller/ShopController.js'
import { Product } from '../../server/model/Product.js'
import { ProductCatalog } from '../../server/model/ProductCatalog.js'
import productDetails from '../../server/products.json' with { type: 'json' }
import { ShopServer } from '../../server/ShopServer.js'

const publicFolder = fileURLToPath(new URL('../../public', import.meta.url))
const catalog = new ProductCatalog(productDetails.map((details) => new Product(details)))

describe('The shop page and the server', () => {
  let server

  beforeAll(async () => {
    server = await new ShopServer(publicFolder, new ShopController(catalog)).listen(0)

    const serverUrl = `http://localhost:${server.address().port}`
    const realFetch = globalThis.fetch

    vi.stubGlobal('fetch', (path) => realFetch(new URL(path, serverUrl)))
  })

  afterAll(() => {
    vi.unstubAllGlobals()
    server.close()
  })

  it('agree on the teas in products.json and their prices', async () => {
    const teas = await new ApiClient().getProducts()

    expect(teas.map((tea) => [tea.name, tea.price])).toEqual(
      productDetails.map((details) => [details.name, details.price])
    )
  })
})
