import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../public/js/model/ApiError.js'
import { CartStorage } from '../../public/js/model/CartStorage.js'
import { CartStorageError } from '../../public/js/model/CartStorageError.js'
import { Product } from '../../public/js/model/Product.js'
import { ShoppingCartWrapper } from '../../public/js/model/ShoppingCartWrapper.js'
import { ShopPage } from '../../public/js/controller/ShopPage.js'

const rooibos = new Product({ name: 'Rooibos', description: 'Red bush tea.', price: 69, image: 'rooibos.webp' })

/**
 * A product list that only records what it was asked to do.
 *
 * @returns {{ show: import('vitest').Mock, showError: import('vitest').Mock, onAddToCart: import('vitest').Mock }}
 *   The fake list.
 */
const fakeProductList = () => ({ show: vi.fn(), showError: vi.fn(), onAddToCart: vi.fn() })

/**
 * Shows the teas through a fake list, and returns the function the list would call when a tea is picked.
 *
 * @param {ShopPage} shopPage - The page to show.
 * @param {ReturnType<typeof fakeProductList>} productList - The fake list the page uses.
 * @returns {Promise<(productName: string) => void>} Picks a tea by name.
 */
const showAndGetPicker = async (shopPage, productList) => {
  await shopPage.show()

  return productList.onAddToCart.mock.calls[0][0]
}

/**
 * A Storage that keeps what is saved in memory, in place of localStorage.
 *
 * @returns {Pick<Storage, 'getItem' | 'setItem'>} An empty storage.
 */
const memoryStorage = () => {
  const values = new Map()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

describe('ShopPage', () => {
  it('adds a bag of the picked tea to the saved cart', async () => {
    const productList = fakeProductList()
    const cartToast = { show: vi.fn() }
    const cartStorage = new CartStorage(memoryStorage())
    const savedCart = new ShoppingCartWrapper()

    savedCart.add(rooibos, 1)
    cartStorage.save(savedCart)

    const shopPage = new ShopPage({ getProducts: async () => [rooibos] }, productList, cartStorage, cartToast)
    const pickTea = await showAndGetPicker(shopPage, productList)

    pickTea('Rooibos')

    expect(cartStorage.load([rooibos]).bagCount).toBe(2)
    expect(cartToast.show).toHaveBeenCalledWith(expect.stringContaining('Bags in your cart: 2'))
  })

  it('says so when a tea already has 99 bags', async () => {
    const productList = fakeProductList()
    const cartToast = { show: vi.fn() }
    const cartStorage = new CartStorage(memoryStorage())
    const fullCart = new ShoppingCartWrapper()

    fullCart.add(rooibos, 99)
    cartStorage.save(fullCart)

    const shopPage = new ShopPage({ getProducts: async () => [rooibos] }, productList, cartStorage, cartToast)
    const pickTea = await showAndGetPicker(shopPage, productList)

    pickTea('Rooibos')

    expect(cartStorage.load([rooibos]).bagCount).toBe(99)
    expect(cartToast.show).toHaveBeenCalledWith(expect.stringContaining('not added'))
  })

  it('says so when the browser does not let the shop save the cart', async () => {
    const productList = fakeProductList()
    const cartToast = { show: vi.fn() }
    const blockedStorage = {
      getItem: () => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      },
    }

    const shopPage = new ShopPage(
      { getProducts: async () => [rooibos] },
      productList,
      new CartStorage(blockedStorage),
      cartToast
    )
    const pickTea = await showAndGetPicker(shopPage, productList)

    pickTea('Rooibos')

    expect(cartToast.show).toHaveBeenCalledWith(expect.stringContaining(new CartStorageError().message))
  })

  it('shows a message when the API fails', async () => {
    const productList = fakeProductList()
    const failingApi = {
      getProducts: async () => {
        throw new ApiError('The server answered 500 for api/products.')
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
