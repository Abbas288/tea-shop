import { describe, expect, it, vi } from 'vitest'
import { CartStorage } from '../../public/js/model/CartStorage.js'
import { CartStorageError } from '../../public/js/model/CartStorageError.js'
import { Product } from '../../public/js/model/Product.js'
import { ShoppingCartWrapper } from '../../public/js/model/ShoppingCartWrapper.js'
import { CartPage } from '../../public/js/controller/CartPage.js'

const rooibos = new Product({ name: 'Rooibos', description: 'Red bush tea.', price: 69, image: 'rooibos.webp' })
const api = { getProducts: async () => [rooibos] }

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

/**
 * A cart page over a saved cart with two bags of Rooibos, and a fake view that records what it was asked to do.
 *
 * @returns {Promise<{ cartStorage: CartStorage, cartView: object }>} The storage and the view after the page is shown.
 */
const showCartWithTwoBags = async () => {
  const cartStorage = new CartStorage(memoryStorage())
  const cartView = { show: vi.fn(), showMessage: vi.fn(), onChangeQuantity: vi.fn(), onRemove: vi.fn() }
  const savedCart = new ShoppingCartWrapper()

  savedCart.add(rooibos, 2)
  cartStorage.save(savedCart)
  await new CartPage(api, cartStorage, cartView).show()

  return { cartStorage, cartView }
}

describe('CartPage', () => {
  it('shows the saved cart with the prices the shop has now', async () => {
    const { cartView } = await showCartWithTwoBags()

    expect(cartView.show.mock.lastCall[0].subtotal).toBe(138)
  })

  it('saves a new number of bags', async () => {
    const { cartStorage, cartView } = await showCartWithTwoBags()
    const changeQuantity = cartView.onChangeQuantity.mock.calls[0][0]

    changeQuantity('Rooibos', 5)

    expect(cartStorage.load([rooibos]).bagCount).toBe(5)
  })

  it('removes a tea', async () => {
    const { cartStorage, cartView } = await showCartWithTwoBags()
    const remove = cartView.onRemove.mock.calls[0][0]

    remove('Rooibos')

    expect(cartStorage.load([rooibos]).isEmpty).toBe(true)
  })

  it('shows the saved cart even if the browser does not let the shop save', async () => {
    const cartStorage = new CartStorage(memoryStorage())
    const cartView = { show: vi.fn(), showMessage: vi.fn(), onChangeQuantity: vi.fn(), onRemove: vi.fn() }
    const savedCart = new ShoppingCartWrapper()

    savedCart.add(rooibos, 2)
    cartStorage.save(savedCart)
    vi.spyOn(cartStorage, 'save').mockImplementation(() => {
      throw new CartStorageError()
    })
    await new CartPage(api, cartStorage, cartView).show()

    expect(cartView.show.mock.lastCall[0].bagCount).toBe(2)
  })

  it('does not show a change the browser did not let the shop save', async () => {
    const { cartStorage, cartView } = await showCartWithTwoBags()
    const changeQuantity = cartView.onChangeQuantity.mock.calls[0][0]
    const shownBefore = cartView.show.mock.calls.length

    vi.spyOn(cartStorage, 'save').mockImplementation(() => {
      throw new CartStorageError()
    })
    changeQuantity('Rooibos', 5)

    expect(cartView.show.mock.calls.length).toBe(shownBefore)
    expect(cartView.showMessage).toHaveBeenCalledWith(new CartStorageError().message)
  })

  it.each([0, 100, Number.NaN])('keeps the bags and says why when the number is %j', async (quantity) => {
    const { cartStorage, cartView } = await showCartWithTwoBags()
    const changeQuantity = cartView.onChangeQuantity.mock.calls[0][0]

    changeQuantity('Rooibos', quantity)

    expect(cartStorage.load([rooibos]).bagCount).toBe(2)
    expect(cartView.showMessage).toHaveBeenCalledWith(expect.stringContaining('1 to 99'))
  })
})
