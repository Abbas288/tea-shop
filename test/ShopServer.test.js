import { fileURLToPath } from 'node:url'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { ShopController } from '../server/controller/ShopController.js'
import { Product } from '../server/model/Product.js'
import { ProductCatalog } from '../server/model/ProductCatalog.js'
import { ShopServer } from '../server/ShopServer.js'

const publicFolder = fileURLToPath(new URL('../public', import.meta.url))
const rooibos = { name: 'Rooibos', description: 'Red bush tea.', price: 69, image: '/images/teas/rooibos.webp' }
const earlGrey = { name: 'Earl Grey', description: 'Black tea.', price: 79, image: '/images/teas/earl-grey.webp' }
const catalog = new ProductCatalog([new Product(rooibos), new Product(earlGrey)])
const shopServer = new ShopServer(publicFolder, new ShopController(catalog))

describe('ShopServer', () => {
  it('shows the shop as the start page', async () => {
    const response = await request(shopServer.requestHandler).get('/')

    expect(response.status).toBe(200)
    expect(response.text).toContain('<title>Tea Shop</title>')
  })

  it.each(['/cart', '/checkout', '/thankyou', '/track', '/admin-login', '/admin'])(
    'serves the page %s without .html',
    async (path) => {
      const response = await request(shopServer.requestHandler).get(path)

      expect(response.status).toBe(200)
      expect(response.type).toBe('text/html')
    }
  )

  it('answers 404 for a page that does not exist', async () => {
    const response = await request(shopServer.requestHandler).get('/about')

    expect(response.status).toBe(404)
  })

  it('sends the products of the catalog as JSON, in their order', async () => {
    const response = await request(shopServer.requestHandler).get('/api/products')

    expect(response.status).toBe(200)
    expect(response.type).toBe('application/json')
    expect(response.body).toEqual([rooibos, earlGrey])
  })
})
