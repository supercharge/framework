'use strict'

const { test } = require('uvu')
const Supertest = require('supertest')
const { Server, Router } = require('../dist')

const app = {
  bindings: {},
  make (key) {
    if (key === 'route') {
      return new Router(this)
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

test('pending .get() route', async () => {
  const server = new Server(app)
  const router = server.router()

  router.prefix('api').get('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/api/name')
    .expect(200, 'Supercharge')
})

test('pending .post() route', async () => {
  const server = new Server(app)
  const router = server.router()

  router
    .prefix('api')
    .post('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .post('/api/name')
    .expect(200, 'Supercharge')
})

test('pending .put() route', async () => {
  const server = new Server(app)
  const router = server.router()

  router
    .prefix('api')
    .put('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .put('/api/name')
    .expect(200, 'Supercharge')
})

test('pending .delete() route', async () => {
  const server = new Server(app)
  const router = server.router()

  router
    .prefix('api')
    .delete('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .delete('/api/name')
    .expect(200, 'Supercharge')
})

test('pending .patch() route', async () => {
  const server = new Server(app)
  const router = server.router()

  router
    .prefix('api')
    .patch('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .patch('/api/name')
    .expect(200, 'Supercharge')
})

test('pending .options() route', async () => {
  const server = new Server(app)
  const router = server.router()

  router
    .prefix('api')
    .options('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .options('/api/name')
    .expect(200, 'Supercharge')
})

test.run()
