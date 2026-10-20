import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app.js'
import { connectToDatabase } from '../../src/config/mongoose.js'
import { seedAdmin } from '../../src/config/seedDatabase.js'
import { AdminModel } from '../../src/models/AdminModel.js'

const email = 'admin@example.se'
const password = 'a-long-admin-password'

/**
 * Logs in with the agent, which keeps the session cookie for its next requests.
 *
 * @param {import('supertest').Agent} agent - From request.agent(app).
 * @param {*} login - Such as { email, password }.
 * @returns {import('supertest').Test} The request.
 */
const logIn = (agent, login) => agent.post('/api/admin/login').send(login)

/**
 * The session cookie the answer sets, without its options.
 *
 * @param {import('supertest').Response} response - An answer to a login.
 * @returns {string | undefined} Such as "connect.sid=s%3A…", or undefined if the answer sets no cookie.
 */
const sessionCookieOf = (response) => response.headers['set-cookie']?.[0].split(';')[0]

describe('The admin login', () => {
  let mongo

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    await connectToDatabase(mongo.getUri())
    await seedAdmin(email, password)
  }, 120_000)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongo.stop()
  })

  it('saves the password hashed', async () => {
    const admin = await AdminModel.findOne({ email })

    expect(admin.password).not.toBe(password)
    expect(admin.password).toMatch(/^\$2b\$10\$/)
  })

  it('sends anyone who is not logged in from the admin page to the login page', async () => {
    const response = await request(app).get('/admin')

    expect(response.status).toBe(302)
    expect(response.headers.location).toBe('admin-login')
  })

  it.each([
    ['a wrong password', { email, password: 'not-the-password' }],
    ['an unknown email address', { email: 'eve@example.se', password }],
    ['an email address that is a query', { email: { $ne: null }, password }],
    ['no password', { email }],
  ])('refuses %s with 401 and keeps the admin page closed', async (_case, login) => {
    const agent = request.agent(app)

    const response = await logIn(agent, login)

    expect(response.status).toBe(401)
    expect(response.body.message).toContain('Wrong email address or password')
    expect((await agent.get('/admin')).status).toBe(302)
  })

  it('opens the admin page after login and closes it after logout', async () => {
    const agent = request.agent(app)

    expect((await logIn(agent, { email, password })).status).toBe(200)

    const adminPage = await agent.get('/admin')

    expect(adminPage.status).toBe(200)
    expect(adminPage.text).toContain('Tea Shop admin')
    expect((await agent.post('/api/admin/logout')).status).toBe(204)
    expect((await agent.get('/admin')).status).toBe(302)
  })

  it('gives the admin a new session at each login', async () => {
    const agent = request.agent(app)

    const firstLogin = await logIn(agent, { email, password })
    const secondLogin = await logIn(agent, { email, password })

    expect(sessionCookieOf(secondLogin)).toBeDefined()
    expect(sessionCookieOf(secondLogin)).not.toBe(sessionCookieOf(firstLogin))
  })
})
