'use strict'

const { expect } = require('expect')
const Supertest = require('supertest')
const { test } = require('@japa/runner')
const { setupApp } = require('./helpers')
const { Server } = require('@supercharge/http')
const { SessionManager, StartSessionMiddleware } = require('../dist')

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

  test('throws when missing a session driver', async () => {
    await expect(
      setupApp({ driver: '' })
    ).rejects.toThrow('Missing session driver. Make sure to configure it in the "config/session.ts" file.')
  })

  test('use the memory driver', async () => {
    const app = await setupApp({ driver: 'memory' })
    const server = new Server(app)
    const sessionManager = app.make('session')

    expect(sessionManager.sessionConfig().driver()).toBe('memory')

    server
      .use(StartSessionMiddleware)
      .use(({ request, response }) => {
        const session = sessionManager.createFrom(request)
        session.set('foo', 'bar')

        return response.payload(session.id())
      })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)

    const sessionId = response.text

    expect(sessionId).toBeDefined()
    expect(String(sessionId).length).toBe(40)
    expect(await sessionManager.driver().read(sessionId)).toMatchObject({ foo: 'bar' })
  })

  test('use the cookie driver', async () => {
    const app = await setupApp({
      driver: 'cookie',
      name: 'supercharge-session-test'
    })
    const server = new Server(app)
    const sessionManager = app.make('session')

    expect(sessionManager.sessionConfig().driver()).toBe('cookie')

    server
      .use(StartSessionMiddleware)
      .use(({ request, response }) => {
        const session = sessionManager.createFrom(request)
        session.set('foo', 'bar')

        return response.payload(session.id())
      })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)

    const sessionId = response.text
    expect(sessionId).toBeDefined()
    expect(String(sessionId).length).toBe(40)

    expect(response.headers['set-cookie'][0].split(';')[0]).toEqual(`supercharge-session-test=${sessionId}`)

    const sessionValue = response.headers['set-cookie'][2].split(';')[0].split('=')
    expect(sessionValue[0]).toEqual(sessionId)

    // because we don‘t have encrypted cookies yet, we can parse and read the value
    const parsed = JSON.parse(sessionValue[1])
    expect(parsed.expires).toBeDefined()
    expect(parsed.data).toBeDefined()
    expect(parsed.data).toMatchObject({ foo: 'bar' })
  })
})
