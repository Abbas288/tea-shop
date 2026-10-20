import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../public/js/services/ApiError.js'
import { CartStorage } from '../../public/js/services/CartStorage.js'
import { CartStorageError } from '../../public/js/services/CartStorageError.js'
import { Product } from '../../public/js/model/Product.js'
import { ShoppingCartWrapper } from '../../public/js/model/ShoppingCartWrapper.js'
import { CartPage } from '../../public/js/pages/CartPage.js'

const rooibos = new Product({ name: 'Rooibos', description: 'Red bush tea.', price: 69, image: 'rooibos.webp' })
const api = {
  getProducts: async () => [rooibos],
  getDiscountCode: async (text) => {
    if (text.trim().toUpperCase() !== 'SAVE10') {
      throw new ApiError('Unknown discount code.', { status: 404 })
    }

    return { code: 'SAVE10', percent: 10 }
  },
}

/**
 * A view that only records what it was asked to do.
 *
 * @returns {object} The fake view.
 */
const fakeCartView = () => ({
  show: vi.fn(),
  showMessage: vi.fn(),
  showDiscountMessage: vi.fn(),
  onAdjustQuantity: vi.fn(),
  onChangeQuantity: vi.fn(),
  onRemove: vi.fn(),
  onApplyDiscount: vi.fn(),
})

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
  const cartView = fakeCartView()
  const savedCart = new ShoppingCartWrapper()

  savedCart.add(rooibos, 2)
  cartStorage.save(savedCart)
  await new CartPage(api, cartStorage, cartView).show()

  return { cartStorage, cartView }
}

describe('CartPage', () => {
  it('shows the saved cart with the prices the shop has now', async () => {
    const cartStorage = new CartStorage(memoryStorage())
    const cartView = fakeCartView()
    const savedCart = new ShoppingCartWrapper()
    const currentRooibos = new Product({
      name: 'Rooibos',
      description: 'Red bush tea.',
      price: 79,
      image: 'rooibos.webp',
    })

    savedCart.add(rooibos, 2)
    cartStorage.save(savedCart)

    await new CartPage({ ...api, getProducts: async () => [currentRooibos] }, cartStorage, cartView).show()

    expect(cartView.show.mock.lastCall[0].subtotal).toBe(158)
  })

  it('saves a new number of bags', async () => {
    const { cartStorage, cartView } = await showCartWithTwoBags()
    const changeQuantity = cartView.onChangeQuantity.mock.calls[0][0]

    changeQuantity('Rooibos', 5)

    expect(cartStorage.load([rooibos]).bagCount).toBe(5)
  })

  it.each([
    { step: 1, expectedBags: 4 },
    { step: -1, expectedBags: 2 },
  ])('adjusts the latest saved quantity by $step when another tab added a bag', async ({ step, expectedBags }) => {
    const { cartStorage, cartView } = await showCartWithTwoBags()
    const adjustQuantity = cartView.onAdjustQuantity.mock.calls[0][0]
    const cartInAnotherTab = cartStorage.load([rooibos])

    cartInAnotherTab.add(rooibos, 1)
    cartStorage.save(cartInAnotherTab)
    adjustQuantity('Rooibos', step)

    expect(cartStorage.load([rooibos]).bagCount).toBe(expectedBags)
    expect(cartView.show.mock.lastCall[0].bagCount).toBe(expectedBags)
  })

  it('removes a tea', async () => {
    const { cartStorage, cartView } = await showCartWithTwoBags()
    const remove = cartView.onRemove.mock.calls[0][0]

    remove('Rooibos')

    expect(cartStorage.load([rooibos]).isEmpty).toBe(true)
  })

  it('shows the saved cart even if the browser does not let the shop save', async () => {
    const cartStorage = new CartStorage(memoryStorage())
    const cartView = fakeCartView()
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

  it('applies a discount code the shop has, and keeps it', async () => {
    const { cartStorage, cartView } = await showCartWithTwoBags()
    const applyDiscount = cartView.onApplyDiscount.mock.calls[0][0]

    await applyDiscount(' save10 ')

    const cart = cartStorage.load([rooibos])

    expect([cart.discountCode, cart.discount, cart.total]).toEqual(['SAVE10', 14, 124])
    expect(cartView.showDiscountMessage).toHaveBeenCalledWith(expect.stringContaining('10% off'))
  })

  it('says so when the shop has no such code', async () => {
    const { cartStorage, cartView } = await showCartWithTwoBags()
    const applyDiscount = cartView.onApplyDiscount.mock.calls[0][0]

    await applyDiscount('FREETEA')

    expect(cartStorage.load([rooibos]).discountCode).toBe('')
    expect(cartView.showDiscountMessage).toHaveBeenCalledWith(expect.stringContaining('Unknown discount code'))
  })

  it('keeps the bags and says why when the new quantity is invalid', async () => {
    const { cartStorage, cartView } = await showCartWithTwoBags()
    const changeQuantity = cartView.onChangeQuantity.mock.calls[0][0]

    changeQuantity('Rooibos', 100)

    expect(cartStorage.load([rooibos]).bagCount).toBe(2)
    expect(cartView.showMessage).toHaveBeenCalledWith(expect.stringContaining('1 to 99'))
  })
})
