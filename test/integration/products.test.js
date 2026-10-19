import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ApiClient } from '../../public/js/model/ApiClient.js'
import { app } from '../../src/app.js'
import productDetails from '../../src/data/products.json' with { type: 'json' }

describe('The shop page and the server', () => {
  let server

  beforeAll(async () => {
    server = await new Promise((resolve, reject) => {
      const runningServer = app.listen(0, (error) => (error ? reject(error) : resolve(runningServer)))
    })

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
