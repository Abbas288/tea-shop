import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from '../../public/js/model/ApiClient.js'
import { ApiError } from '../../public/js/model/ApiError.js'
import { Product } from '../../public/js/model/Product.js'

const rooibos = { name: 'Rooibos', description: 'Red bush tea.', price: 69, image: '/images/teas/rooibos.webp' }

/**
 * Lets fetch answer with the status and body, as JSON.
 *
 * @param {number} status - Such as 200.
 * @param {*} body - What the server sends.
 */
const answerWith = (status, body) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status }))
  )
}

describe('ApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('turns each tea from the API into a Product', async () => {
    answerWith(200, [rooibos])

    const products = await new ApiClient().getProducts()

    expect(products).toHaveLength(1)
    expect(products[0]).toBeInstanceOf(Product)
    expect(products[0].name).toBe('Rooibos')
    expect(fetch).toHaveBeenCalledWith('/api/products')
  })

  it('throws an ApiError when the server answers with an error', async () => {
    answerWith(500, 'down')

    const products = new ApiClient().getProducts()

    await expect(products).rejects.toThrow(ApiError)
    await expect(products).rejects.toThrow('500')
  })

  it('throws an ApiError when the server cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      })
    )

    await expect(new ApiClient().getProducts()).rejects.toThrow(ApiError)
  })

  it.each([
    ['an object', { products: [] }],
    ['a tea priced "free"', [{ ...rooibos, price: 'free' }]],
  ])('throws an ApiError when the server sends %s instead of a list of products', async (_label, body) => {
    answerWith(200, body)

    await expect(new ApiClient().getProducts()).rejects.toThrow(ApiError)
  })
})
