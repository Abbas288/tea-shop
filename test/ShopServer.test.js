import { fileURLToPath } from 'node:url'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { ShopServer } from '../server/ShopServer.js'

const publicFolder = fileURLToPath(new URL('../public', import.meta.url))
const shopServer = new ShopServer(publicFolder)

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
})
