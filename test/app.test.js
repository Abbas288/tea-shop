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

  it('serves a page without .html', async () => {
    const response = await request(app).get('/cart')

    expect(response.status).toBe(200)
    expect(response.type).toBe('text/html')
  })

  it('serves the ShoppingCart package to the browser', async () => {
    const response = await request(app).get('/modules/shopping-cart/index.js')

    expect(response.status).toBe(200)
    expect(response.type).toBe('text/javascript')
  })

  it('answers a discount code with its percent, or 404 and a message', async () => {
    const known = await request(app).get('/api/discount-codes/save10')
    const unknown = await request(app).get('/api/discount-codes/FREETEA')

    expect(known.body).toEqual({ code: 'SAVE10', percent: 10 })
    expect([unknown.status, unknown.body.message]).toEqual([404, 'Unknown discount code.'])
  })

  it('sends the products of the catalog as JSON, in their order', async () => {
    const response = await request(app).get('/api/products')

    expect(response.status).toBe(200)
    expect(response.type).toBe('application/json')
    expect(response.body).toEqual(productDetails)
  })
})
