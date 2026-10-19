import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../public/js/model/ApiError.js'
import { ShopPage } from '../../public/js/controller/ShopPage.js'

/**
 * A product list that only records what it was asked to show.
 *
 * @returns {{ show: import('vitest').Mock, showError: import('vitest').Mock }} The fake list.
 */
const fakeProductList = () => ({ show: vi.fn(), showError: vi.fn() })

describe('ShopPage', () => {
  it('shows a message when the API fails', async () => {
    const productList = fakeProductList()
    const failingApi = {
      getProducts: async () => {
        throw new ApiError('The server answered 500 for /api/products.')
      },
    }

    await new ShopPage(failingApi, productList).show()

    expect(productList.showError).toHaveBeenCalledWith(expect.stringContaining('could not be loaded'))
  })

  it('throws any other error again, so a bug in the page is not shown as a network problem', async () => {
    const productList = fakeProductList()
    const bug = new TypeError('A bug in the page')

    productList.show.mockImplementation(() => {
      throw bug
    })

    await expect(new ShopPage({ getProducts: async () => [] }, productList).show()).rejects.toBe(bug)
    expect(productList.showError).not.toHaveBeenCalled()
  })
})
