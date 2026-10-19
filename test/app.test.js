import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import productDetails from '../src/data/products.json' with { type: 'json' }

describe('The app', () => {
  it('shows the shop as the start page', async () => {
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.text).toContain('<title>Tea Shop</title>')
  })

  it.each(['/cart', '/checkout', '/thankyou', '/track', '/admin-login', '/admin'])(
    'serves the page %s without .html',
    async (path) => {
      const response = await request(app).get(path)

      expect(response.status).toBe(200)
      expect(response.type).toBe('text/html')
    }
  )

  it('answers 404 for a page that does not exist', async () => {
    const response = await request(app).get('/about')

    expect(response.status).toBe(404)
  })

  it('sends the products of the catalog as JSON, in their order', async () => {
    const response = await request(app).get('/api/products')

    expect(response.status).toBe(200)
    expect(response.type).toBe('application/json')
    expect(response.body).toEqual(productDetails)
  })
})
