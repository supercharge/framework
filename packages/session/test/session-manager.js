
import { test } from 'uvu'
import { expect } from 'expect'
import Supertest from 'supertest'
import { Server } from '@supercharge/http'
import { setupApp } from './helpers/index.js'
import { SessionManager, StartSessionMiddleware } from '../dist/index.js'

test('creates a session and generates a new ID if none is present', async () => {
  const app = await setupApp()
  const server = app.make(Server)
  const sessionManager = new SessionManager(app)

  server.use(ctx => {
    const session = sessionManager.createFrom(ctx)

    return ctx.response.payload(session.id())
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
  const server = app.make(Server)
  const sessionManager = app.make('session')

  expect(sessionManager.sessionConfig().driver()).toBe('memory')

  server
    .use(StartSessionMiddleware)
    .use(ctx => {
      const session = sessionManager.createFrom(ctx)
      session.set('foo', 'bar')

      return ctx.response.payload(session.id())
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
  const server = app.make(Server)
  const sessionManager = app.make('session')

  expect(sessionManager.sessionConfig().driver()).toBe('cookie')

  server
    .use(StartSessionMiddleware)
    .use(ctx => {
      const session = sessionManager.createFrom(ctx)
      session.set('foo', 'bar')

      return ctx.response.payload(session.id())
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

test.run()
