import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app.js'
import { connectToDatabase } from '../../src/config/mongoose.js'
import { seedDatabase } from '../../src/config/seedDatabase.js'
import { DiscountCodeModel } from '../../src/models/DiscountCodeModel.js'

describe('Discount codes through the app and MongoDB', () => {
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

  it.each(['SAVE10', 'save10', ' Save10 '])('answer the code typed as %j with its percent', async (text) => {
    const response = await request(app).get(`/api/discount-codes/${encodeURIComponent(text)}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ code: 'SAVE10', percent: 10 })
    expect(response.body).not.toHaveProperty('_id')
  })

  it('answer an unknown code with 404 and a message', async () => {
    const response = await request(app).get('/api/discount-codes/FREETEA')

    expect(response.status).toBe(404)
    expect(response.body.message).toContain('Unknown discount code')
  })

  it('get the percent in discountCodes.json again when seedDatabase runs again', async () => {
    await DiscountCodeModel.updateOne({ code: 'SAVE10' }, { percent: 50 })
    await seedDatabase()

    const response = await request(app).get('/api/discount-codes/SAVE10')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ code: 'SAVE10', percent: 10 })
  })
})
