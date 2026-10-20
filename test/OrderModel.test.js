import mongoose from 'mongoose'
import { describe, expect, it } from 'vitest'
import { OrderModel } from '../src/models/OrderModel.js'

const customer = {
  name: 'Ada Lind',
  email: 'ada@example.se',
  street: 'Storgatan 1',
  postalCode: '352 52',
  city: 'Växjö',
}
const rooibos = { name: 'Rooibos', price: 69, quantity: 1 }
const order = { customer, lines: [rooibos] }

describe('OrderModel', () => {
  it('trims the customer details and gets a number', async () => {
    const document = new OrderModel({ ...order, customer: { ...customer, name: ' Ada Lind ' } })

    await document.validate()

    expect(document.customer.name).toBe('Ada Lind')
    expect(document.number).toMatch(/^[A-HJ-NP-Z2-9]{8}$/)
  })

  it.each([
    ['no name', { name: '  ' }, 'name'],
    ['an email address without a dot', { email: 'ada@example' }, 'email'],
    ['an email address with two dots in a row', { email: 'ada@example..se' }, 'email'],
    ['an email address that ends with a dot', { email: 'ada@example.se.' }, 'email'],
    ['a postal code with four digits', { postalCode: '3525' }, 'postal code'],
    ['a street address of 101 characters', { street: 'a'.repeat(101) }, '100 characters'],
    ['no city', { city: undefined }, 'city'],
  ])('refuses %s', async (_case, change, keyWord) => {
    const document = new OrderModel({ ...order, customer: { ...customer, ...change } })

    const validation = document.validate()

    await expect(validation).rejects.toThrow(mongoose.Error.ValidationError)
    await expect(validation).rejects.toThrow(keyWord)
  })

  it('prices the lines with ShoppingCart and rounds the total to whole kronor', async () => {
    const earlGrey = { name: 'Earl Grey', price: 79, quantity: 2 }
    const document = new OrderModel({
      ...order,
      lines: [rooibos, earlGrey],
      discountCode: 'SAVE10',
      discountPercent: 10,
    })

    await document.validate()

    expect([document.subtotal, document.discount, document.total]).toEqual([227, 23, 204])
  })

  it.each([
    ['no lines', [], 'empty'],
    ['the same tea twice', [rooibos, rooibos], 'twice'],
    ['0 bags', [{ ...rooibos, quantity: 0 }], 'bags'],
    ['100 bags', [{ ...rooibos, quantity: 100 }], 'bags'],
    ['1.5 bags', [{ ...rooibos, quantity: 1.5 }], 'bags'],
  ])('refuses %s', async (_case, lines, keyWord) => {
    const document = new OrderModel({ ...order, lines })

    const validation = document.validate()

    await expect(validation).rejects.toThrow(mongoose.Error.ValidationError)
    await expect(validation).rejects.toThrow(keyWord)
  })

  it('refuses a field the schema does not name', () => {
    const createOrder = () => new OrderModel({ ...order, isPaid: true })

    expect(createOrder).toThrow(mongoose.Error.StrictModeError)
    expect(createOrder).toThrow('isPaid')
  })
})
