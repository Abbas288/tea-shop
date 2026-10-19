import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app.js'
import { connectToDatabase } from '../../src/config/mongoose.js'
import { seedDatabase } from '../../src/config/seedDatabase.js'
import productDetails from '../../src/data/products.json' with { type: 'json' }
import { ProductModel } from '../../src/models/ProductModel.js'

const productsByName = productDetails.toSorted((first, second) => first.name.localeCompare(second.name))

describe('The teas from products.json through MongoDB and the server', () => {
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

  it('are sent as JSON, sorted by name', async () => {
    const response = await request(app).get('/api/products')

    expect(response.status).toBe(200)
    expect(response.type).toBe('application/json')
    expect(response.body).toMatchObject(productsByName)
    expect(response.body[0]).not.toHaveProperty('_id')
    expect(response.body[0]).not.toHaveProperty('__v')
  })

  it('are restored from products.json when seedDatabase runs again', async () => {
    await ProductModel.updateOne({ name: 'Rooibos' }, { price: 1 })
    await ProductModel.deleteOne({ name: 'Earl Grey' })
    await seedDatabase()

    const response = await request(app).get('/api/products')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject(productsByName)
  })
})
