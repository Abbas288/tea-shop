import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../public/js/services/ApiError.js'
import { CartStorage } from '../../public/js/services/CartStorage.js'
import { Product } from '../../public/js/model/Product.js'
import { ShoppingCartWrapper } from '../../public/js/model/ShoppingCartWrapper.js'
import { CheckoutPage } from '../../public/js/pages/CheckoutPage.js'

const rooibos = new Product({ name: 'Rooibos', description: 'Red bush tea.', price: 69, image: 'rooibos.webp' })
const customer = {
  name: 'Ada Lind',
  email: 'ada@example.se',
  street: 'Storgatan 1',
  postalCode: '35252',
  city: 'Växjö',
}

/**
 * A Storage that keeps what is saved in memory, in place of localStorage.
 *
 * @returns {Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>} An empty storage.
 */
const memoryStorage = () => {
  const values = new Map()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

/**
 * A checkout page over a saved cart, with a fake view that records what it was asked to do.
 *
 * @param {number} bags - Bags of Rooibos in the saved cart, 0 for an empty cart.
 * @param {(customer: object, cart: ShoppingCartWrapper) => Promise<object>} placeOrder - What the server answers.
 * @param {Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>} [storage] - Where the cart is saved.
 * @returns {Promise<{ cartStorage: CartStorage, checkoutView: object }>} The storage and the view after the page
 *   is shown.
 */
const showCheckoutWith = async (bags, placeOrder, storage = memoryStorage()) => {
  const api = { getProducts: async () => [rooibos], placeOrder }
  const cartStorage = new CartStorage(storage)
  const checkoutView = {
    showOrder: vi.fn(),
    showCannotOrder: vi.fn(),
    showPlacingOrder: vi.fn(),
    showOrderRefused: vi.fn(),
    goToReceipt: vi.fn(),
    onPlaceOrder: vi.fn(),
  }
  const savedCart = new ShoppingCartWrapper()

  if (bags > 0) {
    savedCart.add(rooibos, bags)
  }

  cartStorage.save(savedCart)
  await new CheckoutPage(api, cartStorage, checkoutView).show()

  return { cartStorage, checkoutView }
}

describe('CheckoutPage', () => {
  it('empties the cart only after the server has saved the order', async () => {
    const receipt = { number: 'K7Q2M9XD' }
    let confirmOrder
    const response = new Promise((resolve) => {
      confirmOrder = resolve
    })
    const sendOrder = vi.fn(() => response)
    const { cartStorage, checkoutView } = await showCheckoutWith(2, sendOrder)
    const placeOrder = checkoutView.onPlaceOrder.mock.calls[0][0]

    const placingOrder = placeOrder(customer)

    try {
      expect(sendOrder).toHaveBeenCalledOnce()
      expect(cartStorage.load([rooibos]).bagCount).toBe(2)
      expect(checkoutView.goToReceipt).not.toHaveBeenCalled()
    } finally {
      confirmOrder(receipt)
    }

    await placingOrder

    expect(cartStorage.load([rooibos]).bagCount).toBe(0)
    expect(checkoutView.goToReceipt).toHaveBeenCalledWith(receipt)
  })

  it.each([
    [400, 'Enter a valid email address.', 'email'],
    [500, 'The server answered 500 for api/orders.', 'try again later'],
  ])('keeps the cart when the server answers %i', async (status, serverMessage, keyWord) => {
    const { cartStorage, checkoutView } = await showCheckoutWith(2, async () => {
      throw new ApiError(serverMessage, { status })
    })
    const placeOrder = checkoutView.onPlaceOrder.mock.calls[0][0]

    await placeOrder(customer)

    expect(cartStorage.load([rooibos]).bagCount).toBe(2)
    expect(checkoutView.showOrderRefused).toHaveBeenCalledWith(expect.stringContaining(keyWord))
    expect(checkoutView.goToReceipt).not.toHaveBeenCalled()
  })

  it('shows the receipt even if the browser does not let the shop empty the cart', async () => {
    const storage = memoryStorage()
    const receipt = { number: 'K7Q2M9XD' }

    storage.removeItem = () => {
      throw new DOMException('Access is denied.', 'SecurityError')
    }

    const { checkoutView } = await showCheckoutWith(2, async () => receipt, storage)
    const placeOrder = checkoutView.onPlaceOrder.mock.calls[0][0]

    await placeOrder(customer)

    expect(checkoutView.goToReceipt).toHaveBeenCalledWith(receipt)
  })

  it('does not send a cart that another tab has changed', async () => {
    const sendOrder = vi.fn()
    const { cartStorage, checkoutView } = await showCheckoutWith(2, sendOrder)
    const placeOrder = checkoutView.onPlaceOrder.mock.calls[0][0]
    const cartInOtherTab = cartStorage.load([rooibos])

    cartInOtherTab.add(rooibos, 1)
    cartStorage.save(cartInOtherTab)
    await placeOrder(customer)

    expect(sendOrder).not.toHaveBeenCalled()
    expect(checkoutView.showOrder.mock.lastCall[0].bagCount).toBe(3)
    expect(checkoutView.showOrderRefused).toHaveBeenCalledWith(expect.stringContaining('changed'))
  })

  it('keeps the bags another tab added while the order was sent', async () => {
    const { cartStorage, checkoutView } = await showCheckoutWith(2, async () => {
      const cartInOtherTab = cartStorage.load([rooibos])

      cartInOtherTab.add(rooibos, 1)
      cartStorage.save(cartInOtherTab)

      return { number: 'K7Q2M9XD' }
    })
    const placeOrder = checkoutView.onPlaceOrder.mock.calls[0][0]

    await placeOrder(customer)

    expect(cartStorage.load([rooibos]).bagCount).toBe(1)
    expect(checkoutView.goToReceipt).toHaveBeenCalled()
  })

  it('keeps checkout unavailable after another tab empties the cart', async () => {
    const sendOrder = vi.fn()
    const { cartStorage, checkoutView } = await showCheckoutWith(2, sendOrder)
    const placeOrder = checkoutView.onPlaceOrder.mock.calls[0][0]

    cartStorage.clear()
    await placeOrder(customer)

    expect(checkoutView.showOrder.mock.lastCall[0].isEmpty).toBe(true)
    expect(checkoutView.showCannotOrder).toHaveBeenCalledWith(expect.stringContaining('empty'))
    expect(checkoutView.showOrderRefused).not.toHaveBeenCalled()
    expect(sendOrder).not.toHaveBeenCalled()

    await placeOrder(customer)

    expect(sendOrder).not.toHaveBeenCalled()
  })

  it('does not send an empty cart even if the submit handler is called', async () => {
    const sendOrder = vi.fn()
    const { checkoutView } = await showCheckoutWith(0, sendOrder)
    const placeOrder = checkoutView.onPlaceOrder.mock.calls[0][0]

    await placeOrder(customer)

    expect(checkoutView.showCannotOrder).toHaveBeenCalledWith(expect.stringContaining('empty'))
    expect(checkoutView.showOrder.mock.lastCall[0].isEmpty).toBe(true)
    expect(sendOrder).not.toHaveBeenCalled()
    expect(checkoutView.showPlacingOrder).not.toHaveBeenCalled()
    expect(checkoutView.goToReceipt).not.toHaveBeenCalled()
  })
})
