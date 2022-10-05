'use strict'

const { expect } = require('expect')
const Supertest = require('supertest')
const { test } = require('@japa/runner')
const { setupApp } = require('./helpers')
const { Server } = require('@supercharge/http')
const { StartSessionMiddleware } = require('../dist')

function createServer (app) {
  const server = app.make(Server).use(StartSessionMiddleware)

  return server
}

async function createInitialSession (app, data = {}) {
  const server = createServer(app)

  server.use(({ request, response }) => {
    Object.entries(data).forEach(([key, value]) => {
      request.session().set(key, value)
    })

    return response.payload({
      id: request.session().id(),
      data: request.session().all()
    })
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  return {
    sessionId: response.body.id,
    sessionData: response.body.data,
    sessionCookie: response.headers['set-cookie']
  }
}

test.group('Cookie Session Driver', () => {
  test('pick up an existing cookie session', async () => {
    const app = await setupApp({ driver: 'cookie' })

    const { sessionId, sessionCookie } = await createInitialSession(app)

    const server = createServer(app).use(({ request, response }) => {
      request.session().set('name', 'Supercharge')

      return response.payload({
        id: request.session().id(),
        data: request.session().all()
      })
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(response.body.id).toEqual(sessionId)
    expect(response.body.data).toMatchObject({ name: 'Supercharge' })
  })

  test('update values in the session', async () => {
    const app = await setupApp({ driver: 'cookie' })

    const { sessionData, sessionCookie } = await createInitialSession(app, {
      foo: 'bar',
      name: 'Supercharge'
    })

    expect(sessionData).toMatchObject({ foo: 'bar', name: 'Supercharge' })

    const server = createServer(app).use(({ request, response }) => {
      request.session()
        .set('foo', 'baz')
        .set('name', 'updated')
        .set('something', 'new')

      return response.payload(request.session().all())
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(response.body).toMatchObject({ foo: 'baz', name: 'updated', something: 'new' })
  })

  test('returns an empty object for an expired session', async () => {
    const app = await setupApp({ driver: 'cookie', lifetime: 0.01 })

    const { sessionData, sessionCookie } = await createInitialSession(app, {
      name: 'Supercharge'
    })

    expect(sessionData).toMatchObject({ name: 'Supercharge' })

    await new Promise(resolve => setTimeout(resolve, 100))

    const server = createServer(app).use(({ request, response }) => {
      return response.payload(request.session().all())
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(Object.keys(response.body).length).toBe(1)
    expect(Object.keys(response.body)).toEqual(['_token'])
  })

  test('destroy a session', async () => {
    const app = await setupApp({ driver: 'cookie' })
    const sessionManager = app.make('session')

    const { sessionId, sessionCookie } = await createInitialSession(app, { foo: 'bar' })
    await sessionManager.driver().destroy(sessionId)

    const server = createServer(app).use(({ request, response }) => {
      return response.payload({
        id: request.session().id(),
        data: request.session().all()
      })
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(Object.keys(response.body.data).length).toBe(1)
    expect(Object.keys(response.body.data)).toEqual(['_token'])
  }).skip()
})
