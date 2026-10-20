import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app.js'
import { connectToDatabase } from '../../src/config/mongoose.js'
import { seedDatabase } from '../../src/config/seedDatabase.js'
import { OrderModel } from '../../src/models/OrderModel.js'

const customer = {
  name: 'Ada Lind',
  email: 'ada@example.se',
  street: 'Storgatan 1',
  postalCode: '35252',
  city: 'Växjö',
}
const lines = [{ name: 'Rooibos', quantity: 1 }]

/**
 * Places an order.
 *
 * @returns {Promise<{ number: string }>} The receipt.
 */
const placeOrder = async () => (await request(app).post('/api/orders').send({ customer, lines })).body

/**
 * Asks for the tracking with the body the form sends.
 *
 * @param {string} number - The order number.
 * @param {*} body - Such as { email: 'ada@example.se' }.
 * @returns {import('supertest').Test} The request.
 */
const track = (number, body) => request(app).post(`/api/orders/${number}/tracking`).send(body)

describe('An order through the app and MongoDB', () => {
  let mongo

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    await connectToDatabase(mongo.getUri())
    await seedDatabase()
  }, 120_000)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongo.stop()
  })

  it('is priced by the server and saved with a number', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        customer,
        lines: [
          { name: 'Rooibos', quantity: 1, price: 1 },
          { name: 'Earl Grey', quantity: 2, price: 1 },
        ],
        discountCode: 'save10',
      })

    expect(response.status).toBe(201)

    const saved = await OrderModel.findOne({ number: response.body.number })

    expect(saved).not.toBeNull()
    expect([saved.subtotal, saved.discountCode, saved.discountPercent, saved.discount, saved.total]).toEqual([
      227,
      'SAVE10',
      10,
      23,
      204,
    ])
    expect(saved.status).toBe('received')
    expect(saved.createdAt).toBeInstanceOf(Date)
  })

  it.each([
    ['an email address without a dot', { customer: { ...customer, email: 'ada@example' }, lines }, 'email'],
    ['an empty cart', { customer, lines: [] }, 'empty'],
    ['a tea the shop does not sell', { customer, lines: [{ name: 'Mint', quantity: 1 }] }, 'does not sell'],
    ['a discount code that is a query', { customer, lines, discountCode: { $ne: null } }, 'discount code'],
    ['an unknown discount code', { customer, lines, discountCode: 'FREETEA' }, 'discount code'],
  ])('is refused with 400 and a message for %s', async (_case, order, keyWord) => {
    const savedOrdersBefore = await OrderModel.countDocuments()

    const response = await request(app).post('/api/orders').send(order)

    expect(response.status).toBe(400)
    expect(response.body.message).toContain(keyWord)
    expect(await OrderModel.countDocuments()).toBe(savedOrdersBefore)
  })

  it('keeps only the customer details the form has', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({ customer: { ...customer, isAdmin: true }, lines })

    expect(response.status).toBe(201)

    const saved = await OrderModel.findOne({ number: response.body.number })

    expect(saved).not.toBeNull()
    expect(saved.customer.toObject()).not.toHaveProperty('isAdmin')
  })

  it('tracks an order with its number and email address, without anything about the customer', async () => {
    const receipt = await placeOrder()

    const response = await track(receipt.number, { email: customer.email })

    expect(response.status).toBe(200)
    expect(Object.keys(response.body).sort()).toEqual([
      'completedSteps',
      'number',
      'remainingSteps',
      'status',
      'statusChangedAt',
    ])
    expect(response.body).toMatchObject({
      number: receipt.number,
      status: 'received',
      completedSteps: ['received'],
      remainingSteps: ['packed', 'shipped', 'delivered'],
    })
  })

  it.each([
    ['another email address', (number) => track(number, { email: 'eve@example.se' })],
    ['no email address', (number) => track(number, {})],
    ['an email address that is a query', (number) => track(number, { email: { $ne: null } })],
    ['an unknown number', () => track('AAAAAAAA', { email: customer.email })],
  ])('answers 404 without the order for %s', async (_case, askForTracking) => {
    const receipt = await placeOrder()

    const response = await askForTracking(receipt.number)

    expect(response.status).toBe(404)
    expect(response.body).not.toHaveProperty('number')
    expect(response.body.message).toContain('no order')
  })

  it.each([
    ['packed', ['received', 'packed'], ['shipped', 'delivered']],
    ['cancelled', ['received', 'cancelled'], []],
  ])('shows the steps done and left for an order that is %s', async (status, completedSteps, remainingSteps) => {
    const receipt = await placeOrder()
    await OrderModel.updateOne({ number: receipt.number }, { status })

    const response = await track(receipt.number, { email: customer.email })

    expect(response.body).toMatchObject({ status, completedSteps, remainingSteps })
  })
})
