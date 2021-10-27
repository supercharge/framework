'use strict'

const { test } = require('uvu')
const expect = require('expect')
const Supertest = require('supertest')
const { Server, Router } = require('../dist')
const ErrorHandler = require('./helpers/error-handler')

const app = {
  bindings: {},
  make (key) {
    if (key === 'route') {
      return new Router(this)
    }

    if (key === 'error.handler') {
      return new ErrorHandler()
    }

    const bindingCallback = this.bindings[key]

    if (bindingCallback) {
      return bindingCallback(this)
    }
  },
  singleton (key, bindingCallback) {
    this.bindings[key] = bindingCallback
  },
  key () {
    return '1234'
  },
  logger () {
    return {
      info () {}
    }
  },
  config () {
    return {
      get () {}
    }
  }
}

test('Starts a server without routes', async () => {
  const server = new Server(app)

  await Supertest(server.callback())
    .get('/')
    .expect(404)
})

test('adds a middleware using a function handler', async () => {
  let called = false

  const server = new Server(app).use(async (ctx) => {
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

  const server = new Server(app)
    .use(async (_, next) => {
      calledFirst = true

      await next()
    })
    .use(async (ctx, next) => {
      calledSecond = true

      await next()

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

  const server = new Server(app)
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

  const server = new Server(app).use(Middleware)

  await Supertest(server.callback())
    .get('/')
    .expect(404)

  expect(called).toEqual(true)
})

test('throws when a Middleware class is not implementing the "handle" method', async () => {
  expect(() => {
    class MiddlewareWithoutHandleMethod {}

    new Server(app).use(MiddlewareWithoutHandleMethod)
  }).toThrow('must implement a "handle" method.')
})

test('server.bootstrap()', async () => {
  const server = new Server(app)

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
  new Server(app)
    .use(ctx => ctx.response.payload('ok'))
    .booted(async (server) => await server.stop())
    .start()
})

test('fails silently with empty error handler', async () => {
  const server = new Server(app).use(ctx => {
    return ctx.response.throw(418, 'Teapot Supercharge')
  })

  await Supertest(server.callback())
    .get('/')
    .expect(418, 'Teapot Supercharge')
})

test.run()
