'use strict'

const { expect } = require('expect')
const Supertest = require('supertest')
const { test } = require('@japa/runner')
const { setupApp } = require('./helpers')
const { Server } = require('@supercharge/http')
const { StartSessionMiddleware, VerifyCsrfTokenMiddleware } = require('../dist')

/**
 * @returns {Server}
 */
function createServer (app) {
  return app
    .forgetInstance(Server)
    .make(Server)
    .use(StartSessionMiddleware)
    .use(VerifyCsrfTokenMiddleware)
}

async function createInitialSession (app, data = {}) {
  const server = createServer(app)

  server.use(async ({ request, response }, next) => {
    Object.entries(data).forEach(([key, value]) => {
      request.session().set(key, value)
    })

    response.payload({
      id: request.session().id(),
      data: request.session().all()
    })

    await next()
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

async function createRequest () {
  const app = await setupApp({ driver: 'memory' })

  const server = createServer(app).use(({ request, response }) => {
    return response.payload(
      request.session().all()
    )
  })

  const { sessionCookie } = await createInitialSession(app)

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .set('Cookie', sessionCookie)

  return {
    session: response.body,
    request: Supertest.agent(server.callback()).set('Cookie', sessionCookie)
  }
}

test.group('CSRF Middleware', () => {
  test('creates a token', async () => {
    const { request } = await createRequest()
    const response = await request.get('/')

    expect(response.body.__token__).toBeDefined()
    expect(response.body.__token__).toHaveLength(40)
  })

  test('creates a new token on every request', async () => {
    const { request: request1 } = await createRequest()
    const response1 = await request1.get('/').expect(200)
    expect(response1.body.__token__).toBeDefined()
    expect(response1.body.__token__).toHaveLength(40)

    const { request: request2 } = await createRequest()
    const response2 = await request2.get('/').expect(200)
    expect(response2.body.__token__).toBeDefined()

    expect(response1.body.__token__ !== response2.body.__token__).toBe(true)
  })

  test('fails when token is missing', async () => {
    const { request } = await createRequest()

    const response = await request
      .post('/')
      .set('accept', 'application/json')
      .expect(403)

    expect(response.body).toMatchObject({
      statusCode: 403,
      message: 'CSRF token mismatch'
    })
  })

  test('fails when token is incorrect', async () => {
    const { request } = await createRequest()

    const response = await request
      .post('/')
      .set('x-csrf-token', 'wrong-csrf-token')
      .set('accept', 'application/json')
      .expect(403)

    expect(response.body).toMatchObject({
      statusCode: 403,
      message: 'CSRF token mismatch'
    })
  })

  test('fails when using token from different session', async () => {
    const { request } = await createRequest()
    const { session } = await createRequest()

    const response = await request
      .post('/')
      .set('x-csrf-token', session.__token__)
      .set('accept', 'application/json')
      .expect(403)

    expect(response.body).toMatchObject({
      statusCode: 403,
      message: 'CSRF token mismatch'
    })
  })

  test('uses valid token from "x-csrf-token" header', async () => {
    const { request, session } = await createRequest()

    await request
      .post('/')
      .set('x-csrf-token', session.__token__)
      .set('accept', 'application/json')
      .expect(200)
  })

  test('uses valid token from "xsrf-token" header', async () => {
    const { request, session } = await createRequest()

    await request
      .post('/')
      .set('xsrf-token', session.__token__)
      .set('accept', 'application/json')
      .expect(200)
  })

  test('uses valid token from "x-xsrf-token" header', async () => {
    const { request, session } = await createRequest()

    await request
      .post('/')
      .set('x-xsrf-token', session.__token__)
      .set('accept', 'application/json')
      .expect(200)
  })

  test('uses valid token from "_csrf" payload', async () => {
    const { request, session } = await createRequest()

    await request
      .post('/')
      .send({ _csrf: session.__token__ })
      .set('accept', 'application/json')
      .expect(200)
  })

  test('uses valid token from "_csrfToken" payload', async () => {
    const { request, session } = await createRequest()

    await request
      .post('/')
      .send({ _csrfToken: session.__token__ })
      .set('accept', 'application/json')
      .expect(200)
  })

  test('has XSRF-TOKEN response cookie', async () => {
    const { request, session } = await createRequest()

    const response = await request
      .post('/')
      .send({ _csrfToken: session.__token__ })
      .set('accept', 'application/json')
      .expect(200)

    const cookies = response.headers['set-cookie']

    expect(
      cookies.some(cookie => cookie === `XSRF-TOKEN=${response.body.__token__}; path=/; httponly`)
    ).toBe(true)
  })

  test('ignores token validation when request path is in "except" array', async () => {
    const app = await setupApp({ driver: 'memory' })

    class ExcludeVerifyCsrfToken extends VerifyCsrfTokenMiddleware {
      exclude () {
        return [
          '/excluded'
        ]
      }
    }

    const server = app
      .forgetInstance(Server)
      .make(Server)
      .use(StartSessionMiddleware)
      .use(ExcludeVerifyCsrfToken)
      .use(({ response }) => {
        return response.payload('ok')
      })

    const { sessionCookie } = await createInitialSession(app)

    await Supertest(server.callback())
      .post('/')
      .set('Cookie', sessionCookie)
      .expect(403)

    await Supertest(server.callback())
      .post('/excluded')
      .set('Cookie', sessionCookie)
      .expect(200, 'ok')
  })
})
