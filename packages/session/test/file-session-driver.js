
/**
 * @typedef {import('../dist').SessionManager} SessionManager
 */

const Path = require('path')
const { expect } = require('expect')
const Fs = require('@supercharge/fs')
const Supertest = require('supertest')
const { test } = require('@japa/runner')
const { setupApp } = require('./helpers')
const { Server } = require('@supercharge/http')
const { StartSessionMiddleware } = require('../dist')

const sessionFileLocation = Path.resolve(__dirname, 'fixtures')

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

  server.use(async ({ request, response }) => {
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

test.group('File Session Driver', group => {
  group.teardown(async () => {
    await Fs.emptyDir(sessionFileLocation)
  })

  test('fails when missing a file location config for session files', async () => {
    const app = await setupApp({
      driver: 'file',
      file: { }
    })

    /** @type {SessionManager} */
    const session = app.make('session')

    expect(() => {
      session.sessionConfig().fileLocation()
    }).toThrow('Session file "location" value is not configured')
  })

  test('fails when providing an empty file location config for session files', async () => {
    const app = await setupApp({
      driver: 'file',
      file: { location: '' }
    })

    /** @type {SessionManager} */
    const session = app.make('session')

    expect(() => {
      session.sessionConfig().fileLocation()
    }).toThrow('Session file "location" value is not configured')
  })

  test('pick up an existing file session', async () => {
    const app = await setupApp({
      driver: 'file',
      file: { location: sessionFileLocation }
    })

    const { sessionId, sessionCookie } = await createInitialSession(app, {
      name: 'Supercharge'
    })

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

    expect(response.body.id).toEqual(sessionId)
    expect(response.body.data).toMatchObject({ name: 'Supercharge' })
  })

  test('update values in the session', async () => {
    const app = await setupApp({
      driver: 'file',
      file: { location: sessionFileLocation }
    })

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

      return response.payload(
        request.session().all()
      )
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)
      .set('Cookie', sessionCookie)

    expect(response.body).toMatchObject({
      foo: 'baz',
      name: 'updated',
      something: 'new'
    })
  })

  test('returns an empty object for an expired session', async () => {
    const app = await setupApp({
      driver: 'file',
      lifetime: 0.01,
      file: { location: sessionFileLocation }
    })

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

    expect(Object.keys(response.body)).toEqual(['__token__'])
  })

  test('destroy a session', async () => {
    const app = await setupApp({
      driver: 'file',
      file: { location: sessionFileLocation }
    })

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

    expect(Object.keys(response.body.data)).toEqual(['__token__'])
  })
})
