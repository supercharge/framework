'use strict'

const { test } = require('uvu')
const expect = require('expect')
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

test('router.get()', async () => {
  const server = new Server(app)
  const router = server.router()

  router.get('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback()).get('/').expect(404)
  await Supertest(server.callback()).get('/name').expect(200, 'Supercharge')
})

test('router.post()', async () => {
  const server = new Server(app)
  const router = server.router()

  router.post('/name', ({ response }) => response.status(201).payload('Supercharge'))

  await server.bootstrap()

  await Supertest(server.callback())
    .post('/name')
    .expect(201, 'Supercharge')
})

test('router.group()', async () => {
  const server = new Server(app)
  const router = server.router()

  router.group('/api', () => {
    router.get('/hello', () => 'Supercharge')
  })

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/api/hello')
    .expect(200, 'Supercharge')
})

test.skip('runs route middleware', async () => {
  // const server = new Server(app)
  // const router = server.router()

  // router.post('/name', ({ response }) => response.status(201).payload('Supercharge'))

  // await server.bootstrap()

  // await Supertest(server.callback()).post('/name').expect(201, 'Supercharge')
})

test.skip('register route middleware for single route in group', async () => {
  // const server = new Server(app)
  // const router = server.router()

  // router.post('/name', ({ response }) => response.status(201).payload('Supercharge'))

  // await server.bootstrap()

  // await Supertest(server.callback()).post('/name').expect(201, 'Supercharge')
})

test.run()
