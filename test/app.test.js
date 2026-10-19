import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app.js'

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
})
