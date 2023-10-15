
const { expect } = require('expect')
const Supertest = require('supertest')
const { test } = require('@japa/runner')
const { setupApp } = require('./helpers')
const { Server } = require('@supercharge/http')
const { StartSessionMiddleware } = require('../dist')

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

test.group('Session', () => {
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
})

test.group('Session | Flash Messages', () => {
  test('flash message lifecycle: set, get, forget', async () => {
    const app = await setupApp({ driver: 'memory' })

    const { sessionCookie } = await createInitialSession(app)

    const server = createServer(app).use(async ({ request, response }) => {
      request.session().flash('foo', 'bar')

      return response.payload(
        request.session().all()
      )
    })

    const initialResponse = await Supertest(server.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(initialResponse.body).toMatchObject({ foo: 'bar' })

    /**
     * Send a second request and grab all the session (flash) data without reflashing
     */
    const server2 = createServer(app).use(({ request, response }) => {
      // flash data from previous request should exist in store
      expect(request.session().all()).toMatchObject({ foo: 'bar' })

      return response.payload(
        request.session().all()
      )
    })

    // this response should not contain the session data anymore
    const emptyResponse = await Supertest(server2.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(emptyResponse.body).not.toMatchObject({ foo: 'bar' })
  })

  test('flash an object', async () => {
    const app = await setupApp({ driver: 'memory' })

    const { sessionCookie } = await createInitialSession(app, {
      name: 'Supercharge'
    })

    const server = createServer(app).use(async ({ request, response }) => {
      request.session().flash({
        foo: 'bar',
        name: 'Supercharge'
      })

      return response.payload(
        request.session().all()
      )
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(response.body).toMatchObject({
      __flash_new__: [],
      __flash_old__: ['foo', 'name'],
      foo: 'bar',
      name: 'Supercharge'
    })
  })

  test('flashing the same key overrides previous flash message', async () => {
    const app = await setupApp({ driver: 'memory' })

    const { sessionId, sessionCookie } = await createInitialSession(app)

    const driver = app.make('session').driver()
    await driver.write(sessionId, {
      name: 'Supercharge',
      __flash_old__: ['name']
    })

    const server = createServer(app).use(async ({ request, response }) => {
      request.session().flash({
        name: 'Supercharge-Flash'
      })

      return response.payload(
        request.session().all()
      )
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(response.body).toMatchObject({
      __flash_new__: [],
      __flash_old__: ['name'],
      name: 'Supercharge-Flash'
    })
  })

  test('reflash existing flash messages', async () => {
    const app = await setupApp({ driver: 'memory' })

    const { sessionId, sessionCookie } = await createInitialSession(app, {
      name: 'Supercharge'
    })

    const driver = app.make('session').driver()
    await driver.write(sessionId, {
      foo: 'bar',
      __flash_old__: ['foo']
    })

    const server = createServer(app).use(async ({ request, response }) => {
      request.session()
        .flash('key', 'some-value')
        .reflash()

      return response.payload(
        request.session().all()
      )
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(response.body).toMatchObject({
      __flash_new__: [],
      __flash_old__: ['key', 'foo'],
      foo: 'bar',
      key: 'some-value'
    })
  })

  test('reflash selected flash messages', async () => {
    const app = await setupApp({ driver: 'memory' })

    const { sessionId, sessionCookie } = await createInitialSession(app, {
      name: 'Supercharge'
    })

    const driver = app.make('session').driver()
    await driver.write(sessionId, {
      foo: 'bar',
      baz: 'blur',
      __flash_old__: ['foo', 'baz']
    })

    const server = createServer(app).use(async ({ request, response }) => {
      request.session().reflash('foo')

      return response.payload(
        request.session().all()
      )
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(response.body).not.toMatchObject({ baz: 'blur' })
    expect(response.body).toMatchObject({
      __flash_new__: [],
      __flash_old__: ['foo'],
      foo: 'bar'
    })
  })
})
