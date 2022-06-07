'use strict'

const { expect } = require('expect')
const Supertest = require('supertest')
const { test } = require('@japa/runner')
const { setupApp } = require('./helpers')
const { SessionManager } = require('../dist')
const { Server } = require('@supercharge/http')

test.group('Session Manager', () => {
  test('creates a session and generates a new ID if none is present', async () => {
    const app = await setupApp()
    const server = new Server(app)
    const sessionManager = new SessionManager(app)

    server.use(({ request, response }) => {
      const session = sessionManager.createFrom(request)

      return response.payload(session.id())
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)

    const sessionId = response.text

    expect(sessionId).toBeDefined()
    expect(String(sessionId).length).toBe(40)
  })
})
