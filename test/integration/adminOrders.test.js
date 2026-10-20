import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app.js'
import { connectToDatabase } from '../../src/config/mongoose.js'
import { seedAdmin, seedDatabase } from '../../src/config/seedDatabase.js'
import { OrderModel } from '../../src/models/OrderModel.js'

const admin = { email: 'admin@example.se', password: 'a-long-admin-password' }
const customer = {
  name: 'Ada Lind',
  email: 'ada@example.se',
  street: 'Storgatan 1',
  postalCode: '35252',
  city: 'Växjö',
}

/**
 * Places an order with two Earl Grey.
 *
 * @returns {Promise<string>} The order number.
 */
const placeOrder = async () => {
  const response = await request(app)
    .post('/api/orders')
    .send({ customer, lines: [{ name: 'Earl Grey', quantity: 2 }] })

  return response.body.number
}

/**
 * An agent with an admin's session cookie.
 *
 * @returns {Promise<import('supertest').Agent>} The logged-in agent.
 */
const logInAsAdmin = async () => {
  const agent = request.agent(app)

  await agent.post('/api/admin/login').send(admin)

  return agent
}

/**
 * Sends the event to change the order's status.
 *
 * @param {import('supertest').Agent} agent - A logged-in agent.
 * @param {string} number - The order number.
 * @param {*} event - Such as "pack".
 * @returns {import('supertest').Test} The request.
 */
const sendEvent = (agent, number, event) => agent.post(`/api/admin/orders/${number}/events`).send({ event })

describe('The admin and the orders', () => {
  let mongo

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    await connectToDatabase(mongo.getUri())
    await seedDatabase()
    await seedAdmin(admin.email, admin.password)
  }, 120_000)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongo.stop()
  })

  it.each([
    ['the list', () => request(app).get('/api/admin/orders')],
    ['an order', (number) => request(app).get(`/api/admin/orders/${number}`)],
    ['an unknown order', () => request(app).get('/api/admin/orders/AAAAAAAA')],
    ['a status change', (number) => request(app).post(`/api/admin/orders/${number}/events`).send({ event: 'pack' })],
    ['an undo', (number) => request(app).post(`/api/admin/orders/${number}/undo`)],
  ])('refuses %s with 401 without login', async (_case, askAsAnyone) => {
    const number = await placeOrder()

    const response = await askAsAnyone(number)

    expect(response.status).toBe(401)
    expect(response.body).not.toHaveProperty('number')
    expect((await OrderModel.findOne({ number })).status).toBe('received')
  })

  it('lists the orders, newest first', async () => {
    const olderNumber = await placeOrder()
    const newerNumber = await placeOrder()
    const agent = await logInAsAdmin()

    const response = await agent.get('/api/admin/orders')
    const numbers = response.body.map((order) => order.number)

    expect(response.status).toBe(200)
    expect(numbers.indexOf(newerNumber)).toBeLessThan(numbers.indexOf(olderNumber))
    expect(Object.keys(response.body[0]).sort()).toEqual(['createdAt', 'number', 'status', 'total'])
  })

  it('shows an order with the customer, the teas and the events it can take', async () => {
    const number = await placeOrder()
    const agent = await logInAsAdmin()

    const response = await agent.get(`/api/admin/orders/${number}`)

    expect(response.body).toMatchObject({
      number,
      status: 'received',
      customer,
      lines: [{ name: 'Earl Grey', quantity: 2, price: 79 }],
      total: 158,
      allowedEvents: ['pack', 'cancel'],
    })
  })

  it('changes the status, and the tracking shows the new one', async () => {
    const number = await placeOrder()
    const agent = await logInAsAdmin()

    const response = await sendEvent(agent, number, 'pack')
    const tracking = await request(app).post(`/api/orders/${number}/tracking`).send({ email: customer.email })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ status: 'packed', allowedEvents: ['ship', 'cancel'] })
    expect(tracking.body.status).toBe('packed')
  })

  it.each([
    ['ship a received order', [], 'ship', 'received'],
    ['cancel a shipped order', ['pack', 'ship'], 'cancel', 'shipped'],
    ['pack a cancelled order', ['cancel'], 'pack', 'cancelled'],
  ])('refuses to %s with 409', async (_case, eventsBefore, event, status) => {
    const number = await placeOrder()
    const agent = await logInAsAdmin()

    for (const eventBefore of eventsBefore) {
      await sendEvent(agent, number, eventBefore)
    }

    const response = await sendEvent(agent, number, event)

    expect(response.status).toBe(409)
    expect(response.body.message).toContain('cannot be changed')
    expect((await OrderModel.findOne({ number })).status).toBe(status)
  })

  it('undoes the latest change step by step, back along the way the order went', async () => {
    const number = await placeOrder()
    const agent = await logInAsAdmin()

    await sendEvent(agent, number, 'pack')
    await sendEvent(agent, number, 'cancel')

    const firstUndo = await agent.post(`/api/admin/orders/${number}/undo`)
    const secondUndo = await agent.post(`/api/admin/orders/${number}/undo`)
    const tracking = await request(app).post(`/api/orders/${number}/tracking`).send({ email: customer.email })

    expect(firstUndo.body).toMatchObject({ status: 'packed', lastEvent: 'pack', allowedEvents: ['ship', 'cancel'] })
    expect(secondUndo.body).toMatchObject({ status: 'received', lastEvent: '' })
    expect(tracking.body.status).toBe('received')
  })

  it('refuses to undo an order without changes with 409', async () => {
    const number = await placeOrder()
    const agent = await logInAsAdmin()

    const response = await agent.post(`/api/admin/orders/${number}/undo`)

    expect(response.status).toBe(409)
    expect((await OrderModel.findOne({ number })).status).toBe('received')
  })

  it.each([
    ['an unknown event', 'fly'],
    ['an event that is a query', { $ne: null }],
    ['no event', undefined],
  ])('refuses %s with 400', async (_case, event) => {
    const number = await placeOrder()
    const agent = await logInAsAdmin()

    const response = await sendEvent(agent, number, event)

    expect(response.status).toBe(400)
    expect((await OrderModel.findOne({ number })).status).toBe('received')
  })
})
