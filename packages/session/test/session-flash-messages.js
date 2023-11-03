
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

test.run()
