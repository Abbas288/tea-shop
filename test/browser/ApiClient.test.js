import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from '../../public/js/ApiClient.js'
import { ApiError } from '../../public/js/ApiError.js'
import { Product } from '../../public/js/Product.js'

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

    await expect(new ApiClient().getProducts()).rejects.toThrow(
      new ApiError('The server answered 500 for /api/products.')
    )
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

  it.each([[{ products: [] }], [[{ ...rooibos, price: 'free' }]]])(
    'throws an ApiError when the server sends %j instead of a list of products',
    async (body) => {
      answerWith(200, body)

      await expect(new ApiClient().getProducts()).rejects.toThrow(
        new ApiError('The server did not send a list of products.')
      )
    }
  )
})
