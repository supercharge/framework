'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { Server, Route } = require('../dist')
const Supertest = require('supertest')
const { setupApp } = require('./helpers')

let app = setupApp()

test.before.each(() => {
  app = setupApp()
})

test('Starts a server without routes', async () => {
  const server = app.make(Server)

  await Supertest(server.callback())
    .get('/')
    .expect(404)
})

test('adds a middleware using a function handler', async () => {
  let called = false

  const server = app.make(Server).use(async (ctx) => {
    called = true

    return ctx.response.payload('ok')
  })

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'ok')

  expect(called).toEqual(true)
})

test('proceeds middleware chain when calling next', async () => {
  let calledFirst = false
  let calledSecond = false

  const server = app.make(Server)

  server
    .use(async (_, next) => {
      calledFirst = true

      await next()
    })
    .use(async (_, next) => {
      calledSecond = true

      await next()
    })
    .router().get('/', (ctx) => {
      return ctx.response.payload('ok')
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'ok')

  expect(calledFirst).toEqual(true)
  expect(calledSecond).toEqual(true)
})

test('stops middleware chain when not calling next', async () => {
  let calledFirst = false
  let calledSecond = false

  const server = app.make(Server)
    .use(async (ctx) => {
      calledFirst = true

      return ctx.response.payload('ok')
    })
    .use(async (ctx) => {
      calledSecond = true

      return ctx.response.payload('not ok')
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'ok')

  expect(calledFirst).toEqual(true)
  expect(calledSecond).toEqual(false)
})

test('adds a middleware using a Middleware class', async () => {
  let called = false

  class Middleware {
    handle () {
      called = true
    }
  }

  const server = app.make(Server).use(Middleware)

  await Supertest(server.callback())
    .get('/')
    .expect(404)

  expect(called).toEqual(true)
})

test('throws when a Middleware class is not implementing the "handle" method', async () => {
  expect(() => {
    class MiddlewareWithoutHandleMethod {}

    app.make(Server).use(MiddlewareWithoutHandleMethod)
  }).toThrow('must implement a "handle" method.')
})

test('server.bootstrap()', async () => {
  const server = app.make(Server)
  server.router().get('/', () => 'hello Supercharge')

  await server.bootstrap()
  expect(server.isBootstrapped()).toEqual(true)
  await server.bootstrap()
  expect(server.isBootstrapped()).toEqual(true)

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'hello Supercharge')
})

test('server.start() and server.stop()', async () => {
  app.make(Server)
    .use(ctx => ctx.response.payload('ok'))
    .booted(async (server) => await server.stop())
    .start()
})

test('fails silently with empty error handler', async () => {
  const server = app.make(Server).use(ctx => {
    return ctx.response.throw(418, 'Teapot Supercharge')
  })

  await Supertest(server.callback())
    .get('/')
    .expect(418, 'Teapot Supercharge')
})

test('server.useRouteMiddleware()', async () => {
  class Middleware {
    handle () {}
  }

  const server = app.make(Server).useRouteMiddleware('noop', Middleware)

  expect(server.router().hasMiddleware('noop')).toBe(true)
})

test('server.clearRoutes()', async () => {
  const server = app.make(Server)

  server.router().routes().add(
    new Route(['GET'], '/', () => {}, app)
  )

  expect(server.router().routes().count()).toBe(1)
  server.clearRoutes()
  expect(server.router().routes().count()).toBe(0)

  // ensure no route matches
  await Supertest(server.callback())
    .get('/')
    .expect(404)
})

test.run()
