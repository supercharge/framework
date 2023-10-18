
import { test } from 'uvu'
import { expect } from 'expect'
import Supertest from 'supertest'
import { Server } from '@supercharge/http'
import { setupApp } from './helpers/index.js'
import { StartSessionMiddleware } from '../dist/index.js'

/**
 * @returns {Server}
 */
function createServer (app) {
  return app
    .forgetInstance(Server)
    .make(Server)
    .use(StartSessionMiddleware)
}

async function createInitialSession (app, data = {}) {
  const server = createServer(app)

  server.use(async ({ request, response }, next) => {
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

test('retrieve session values', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app, {
    name: 'Supercharge'
  })

  const server = createServer(app).use(({ request, response }) => {
    return response.payload({
      name: request.session().get('name')
    })
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toMatchObject({ name: 'Supercharge' })
})

test('use a default value when session value is not present', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app)

  const server = createServer(app).use(({ request, response }) => {
    return response.payload({
      value: request.session().get('not-existing', 'default-value')
    })
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toMatchObject({ value: 'default-value' })
})

test('session has a value', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app, {
    name: 'Supercharge'
  })

  const server = createServer(app).use(({ request, response }) => {
    return response.payload({
      existing: request.session().has('name'),
      notExisting: request.session().has('not-existing')
    })
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toMatchObject({
    existing: true,
    notExisting: false
  })
})

test('put key-value-pair', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app)

  const server = createServer(app).use(({ request, response }) => {
    request.session().put('key', 'value')

    return response.payload(
      request.session().all()
    )
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toMatchObject({ key: 'value' })
})

test('set key-value-pair', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app)

  const server = createServer(app).use(({ request, response }) => {
    request.session().set('key', 'value')

    return response.payload(
      request.session().all()
    )
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toMatchObject({ key: 'value' })
})

test('set object', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app)

  const server = createServer(app).use(({ request, response }) => {
    request.session().set({ key: 'value' })

    return response.payload(
      request.session().all()
    )
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toMatchObject({ key: 'value' })
})

test('delete properties from the session', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app, {
    name: 'Supercharge'
  })

  const server = createServer(app).use(({ request, response }) => {
    request.session()
      .set({ key: 'value' })
      .delete('name')

    return response.payload(
      request.session().all()
    )
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toMatchObject({ key: 'value' })
  expect(response.body).not.toMatchObject({ name: 'Supercharge' })
})

test('delete many properties at once from the session', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app, {
    name: 'Supercharge'
  })

  const server = createServer(app).use(({ request, response }) => {
    request.session()
      .set({ key: 'value' })
      .delete('name', 'key')
      .set('foo', 'bar')

    return response.payload(
      request.session().all()
    )
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toMatchObject({ foo: 'bar' })
  expect(response.body).not.toMatchObject({ key: 'value', name: 'Supercharge' })
})

test('delete clears the session when not passing a property name', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app, {
    name: 'Supercharge'
  })

  const server = createServer(app).use(({ request, response }) => {
    request.session()
      .set({ key: 'value' })
      .delete()

    return response.payload(
      request.session().all()
    )
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toEqual({ })
})

test('pull session items', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app, {
    name: 'Supercharge'
  })

  const server = createServer(app).use(({ request, response }) => {
    const name = request.session()
      .set({ key: 'value' })
      .pull('name')

    return response.payload({
      name, values: request.session().all()
    })
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toMatchObject({
    name: 'Supercharge',
    values: { key: 'value' }
  })
})

test('clear session values', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app, {
    foo: 'bar'
  })

  const server = createServer(app).use(({ request, response }) => {
    request.session().clear()

    return response.payload(
      request.session().all()
    )
  })

  await Supertest(server.callback())
    .get('/')
    .expect(200, {})
    .set('Cookie', sessionCookie)
})

test('push', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionCookie } = await createInitialSession(app, {
    foo: 'bar'
  })

  const server = createServer(app).use(({ request, response }) => {
    request.session()
      .push('array', 'first')
      .push('array', 'second')

    return response.payload(
      request.session().all()
    )
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body).toMatchObject({ array: ['first', 'second'] })
})

test('regenerate session id', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionId, sessionCookie } = await createInitialSession(app, {
    foo: 'bar'
  })

  const server = createServer(app).use(({ request, response }) => {
    request.session().regenerate()

    return response.payload({
      newSessionId: request.session().id(),
      values: request.session().all()
    })
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(sessionId).not.toEqual(response.body.newSessionId)
  expect(response.body.values).toMatchObject({ foo: 'bar' })
})

test('regenerate session id destroys the previous session', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionId, sessionCookie } = await createInitialSession(app, {
    foo: 'bar'
  })

  const server = createServer(app).use(({ request, response }) => {
    request.session().regenerate()

    return response.payload({
      newSessionId: request.session().id(),
      values: request.session().all()
    })
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(sessionId).not.toEqual(response.body.newSessionId)
  expect(response.body.values).toMatchObject({ foo: 'bar' })

  const responseFromOldSessionCookie = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(sessionId).not.toEqual(responseFromOldSessionCookie.body.newSessionId)
  expect(
    Object.keys(responseFromOldSessionCookie.body.values)
  ).toEqual(['__token__'])
})

test('invalidate session: clears values and regenerates the id', async () => {
  const app = await setupApp({ driver: 'memory' })

  const { sessionId, sessionCookie } = await createInitialSession(app, {
    foo: 'bar'
  })

  const server = createServer(app).use(({ request, response }) => {
    request.session().invalidate()

    return response.payload({
      sessionId: request.session().id(),
      values: request.session().all()
    })
  })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)
    .set('Cookie', sessionCookie)

  expect(response.body.sessionId).not.toEqual(sessionId)
  expect(response.body.values).toEqual({})
})

test.run()
