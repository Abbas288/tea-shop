import { describe, expect, it } from 'vitest'
import { ShopController } from '../server/controller/ShopController.js'
import { Product } from '../server/model/Product.js'
import { ProductCatalog } from '../server/model/ProductCatalog.js'

describe('ShopController', () => {
  it('lists the teas of the catalog, without any HTTP', () => {
    const rooibos = new Product({ name: 'Rooibos', description: 'A tea.', price: 69, image: '/images/tea.webp' })
    const shopController = new ShopController(new ProductCatalog([rooibos]))

    expect(shopController.listProducts()).toEqual([rooibos])
  })
})
