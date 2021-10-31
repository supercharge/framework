'use strict'

const { test } = require('uvu')
const expect = require('expect')
const Supertest = require('supertest')
const { Server, Router } = require('../dist')
const { isConstructor } = require('@supercharge/classes')

const app = {
  bindings: {},
  make (key) {
    if (isConstructor(key)) {
      // eslint-disable-next-line new-cap
      return new key(this)
    }

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

test('router.put()', async () => {
  const server = new Server(app)
  const router = server.router()

  router.put('/name', ({ response }) => response.status(202).payload('Supercharge'))

  await server.bootstrap()

  await Supertest(server.callback())
    .put('/name')
    .expect(202, 'Supercharge')
})

test('router.delete()', async () => {
  const server = new Server(app)
  const router = server.router()

  router.delete('/name', ({ response }) => response.status(204))

  await server.bootstrap()

  await Supertest(server.callback())
    .delete('/name')
    .expect(204)
})

test('router.patch()', async () => {
  const server = new Server(app)
  const router = server.router()

  router.patch('/name', ({ response }) => response.status(200))

  await server.bootstrap()

  await Supertest(server.callback())
    .patch('/name')
    .expect(200)
})

test('router.options()', async () => {
  const server = new Server(app)
  const router = server.router()

  router.options('/name', ({ response }) => response.status(200))

  await server.bootstrap()

  await Supertest(server.callback())
    .options('/name')
    .expect(200)
})

test('router.get() with controller class', async () => {
  class Controller {
    handle () {
      return 'Supercharge'
    }
  }

  const server = new Server(app)
  const router = server.router()

  router.get('/name', Controller)

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/name')
    .expect(200, 'Supercharge')
})

test('fails for route controller class without .handle() method', async () => {
  class Controller { }

  const server = new Server(app)
  const router = server.router()

  router.get('/name', Controller)

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/name')
    .expect(500)
})

test('router.group() without route prefix', async () => {
  const server = new Server(app)
  const router = server.router()

  router.group(() => {
    router.get('/hello', () => 'Supercharge')
  })

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/hello')
    .expect(200, 'Supercharge')
})

test('router.group() with route prefix', async () => {
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

test('router.group() ensures prefix starts with slash', async () => {
  const server = new Server(app)
  const router = server.router()

  router.group('api', () => {
    router.get('/hello', () => 'Supercharge')
  })

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/api/hello')
    .expect(200, 'Supercharge')
})

test('router.group() ensures prefix starts with single slash', async () => {
  const server = new Server(app)
  const router = server.router()

  router.group('/////api', () => {
    router.get('/hello', () => 'Supercharge')
  })

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/api/hello')
    .expect(200, 'Supercharge')
})

test('router.group() with attributes object', async () => {
  const server = new Server(app)
  const router = server.router()

  router.group({ prefix: 'api' }, () => {
    router.get('/hello', () => 'Supercharge')
  })

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/api/hello')
    .expect(200, 'Supercharge')
})

test('fails when not providing a callback to router.group()', async () => {
  const server = new Server(app)
  const router = server.router()

  expect(() => router.group('api')).toThrow()
})

test('router.prefix()', async () => {
  const server = new Server(app)
  const router = server.router()

  router.prefix('/api').get('/hello', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/api/hello')
    .expect(200, 'Supercharge')
})

test('router.prefix().group() ', async () => {
  const server = new Server(app)
  const router = server.router()

  router.prefix('/api').group(() => {
    router.get('/hello', () => 'Supercharge')
  })

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/api/hello')
    .expect(200, 'Supercharge')
})

test('runs route middleware', async () => {
  let called = false

  class CallerMiddlware {
    async handle (_, next) {
      called = true
      await next()
    }
  }

  const server = new Server(app)
  server.useRouteMiddleware('caller', CallerMiddlware)

  const router = server.router()

  router
    .post('/name', ({ response }) => response.status(201).payload('Supercharge'))
    .middleware('caller')

  await server.bootstrap()

  await Supertest(server.callback())
    .post('/name')
    .expect(201, 'Supercharge')

  expect(called).toBe(true)
})

test('fails when registering middleware alias without a name', async () => {
  const server = new Server(app)
  const router = server.router()

  expect(
    () => router.registerAliasMiddleware()
  ).toThrow('Missing route-level middleware name')
})

test('fails when registering middleware alias without a middleware class', async () => {
  const server = new Server(app)
  const router = server.router()

  expect(
    () => router.registerAliasMiddleware('name')
  ).toThrow('You must provide a class constructor for the route-level middleware "name"')
})

test('fails when adding not-registered middleware to route', async () => {
  const server = new Server(app)

  const router = server.router()

  router
    .post('/name', ({ response }) => response.payload('Supercharge'))
    .middleware('unknown')

  await expect(
    server.bootstrap()
  ).rejects.toThrow('Route-level middleware "unknown" is not registered in your HTTP kernel')
})

test('router.middleware()', async () => {
  let called = false

  class CallerMiddlware {
    async handle (_, next) {
      called = true
      await next()
    }
  }

  const server = new Server(app)
  const router = server.router()

  router
    .registerAliasMiddleware('caller', CallerMiddlware)
    .middleware('caller')
    .get('/hello', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/hello')
    .expect(200, 'Supercharge')

  expect(called).toBe(true)
})

test('router.middleware() registers and calls multiple middleware', async () => {
  let calledOne = false
  let calledTwo = false

  class FirstCallerMiddlware {
    async handle (_, next) {
      calledOne = true
      await next()
    }
  }

  class SecondCallerMiddlware {
    async handle (_, next) {
      calledTwo = true
      await next()
    }
  }

  const server = new Server(app)
  const router = server.router()

  router
    .registerAliasMiddleware('caller1', FirstCallerMiddlware)
    .registerAliasMiddleware('caller2', SecondCallerMiddlware)
    .middleware(['caller1', 'caller2'])
    .get('/hello', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/hello')
    .expect(200, 'Supercharge')

  expect(calledOne).toBe(true)
  expect(calledTwo).toBe(true)
})

test('fails when using router.middleware() with unknown middleware', async () => {
  const server = new Server(app)

  const router = server.router()

  router
    .middleware('unknown')
    .middleware('another-unkown')
    .post('/name', ({ response }) => response.payload('Supercharge'))

  await expect(
    server.bootstrap()
  ).rejects.toThrow('Route-level middleware "unknown" is not registered in your HTTP kernel')
})

test('returns status 204 for empty responses', async () => {
  const server = new Server(app)
  const router = server.router()

  router.get('/name', () => '')

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/name')
    .expect(204)
})

test('handles redirects', async () => {
  const server = new Server(app)
  const router = server.router()

  router.get('/name', ctx => ctx.response.redirect('/login'))

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/name')
    .expect(302)
})

test('throws when returning a null response', async () => {
  const server = new Server(app)
  const router = server.router()

  router.get('/name', ctx => null)

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/name')
    .expect(500)
})

test('register route middleware for single route in group', async () => {
  // const server = new Server(app)
  // const router = server.router()

  // router.post('/name', ({ response }) => response.status(201).payload('Supercharge'))

  // await server.bootstrap()

  // await Supertest(server.callback()).post('/name').expect(201, 'Supercharge')
})

test.run()
