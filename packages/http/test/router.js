
import { test } from 'uvu'
import { expect } from 'expect'
import Supertest from 'supertest'
import { Server } from '../dist/index.js'
import { setupApp } from './helpers/index.js'
import { HttpError } from '@supercharge/http-errors'

let app = setupApp()

test.before.each(() => {
  app = setupApp()
})

test('ensure matched route stops in middleware', async () => {
  const server = app.make(Server).use(async ({ response }) => {
    return response.status(201).payload('ok')
  })

  server.router().get('/', ({ response }) => {
    return response.status(200).payload('from route handler')
  })

  server.bootstrap()

  await Supertest(server.callback()).get('/').expect(201, 'ok')
})

test('router.get()', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.get('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback()).get('/').expect(404)
  await Supertest(server.callback()).get('/name').expect(200, 'Supercharge')
})

test('router.post()', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.post('/name', ({ response }) => response.status(201).payload('Supercharge'))

  await server.bootstrap()

  await Supertest(server.callback())
    .post('/name')
    .expect(201, 'Supercharge')
})

test('router.put()', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.put('/name', ({ response }) => response.status(202).payload('Supercharge'))

  await server.bootstrap()

  await Supertest(server.callback())
    .put('/name')
    .expect(202, 'Supercharge')
})

test('router.delete()', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.delete('/name', ({ response }) => response.status(204))

  await server.bootstrap()

  await Supertest(server.callback())
    .delete('/name')
    .expect(204)
})

test('router.patch()', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.patch('/name', ({ response }) => response.status(200))

  await server.bootstrap()

  await Supertest(server.callback())
    .patch('/name')
    .expect(200)
})

test('router.options()', async () => {
  const server = app.make(Server)
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

  const server = app.make(Server)
  const router = server.router()

  router.get('/name', Controller)

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/name')
    .expect(200, 'Supercharge')
})

test('fails for route controller class without .handle() method', async () => {
  class Controller { }

  const server = app.make(Server)
  const router = server.router()

  router.get('/should-fail', Controller)

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/should-fail')
    .expect(500)
})

test('router.group() without route prefix', async () => {
  const server = app.make(Server)
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
  const server = app.make(Server)
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
  const server = app.make(Server)
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
  const server = app.make(Server)
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
  const server = app.make(Server)
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
  const server = app.make(Server)
  const router = server.router()

  expect(() => router.group('api')).toThrow()
})

test('router.prefix()', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.prefix('/api').get('/hello', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/api/hello')
    .expect(200, 'Supercharge')
})

test('router.prefix().group() ', async () => {
  const server = app.make(Server)
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

  class CallerMiddleware {
    async handle (_, next) {
      called = true
      await next()
    }
  }

  const server = app.make(Server)
  server.useRouteMiddleware('caller', CallerMiddleware)

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
  const server = app.make(Server)
  const router = server.router()

  expect(
    () => router.registerAliasMiddleware()
  ).toThrow('Missing route-level middleware name')
})

test('fails when registering middleware alias without a middleware class', async () => {
  const server = app.make(Server)
  const router = server.router()

  expect(
    () => router.registerAliasMiddleware('name')
  ).toThrow('You must provide a class constructor for the route-level middleware "name"')
})

test('fails when adding not-registered middleware to route', async () => {
  const server = app.make(Server)

  server.router()
    .post('/name', ({ response }) => response.payload('Supercharge'))
    .middleware('unknown')

  expect(
    () => server.bootstrap()
  ).toThrow('Route-level middleware "unknown" is not registered in your HTTP kernel')
})

test('router.middleware()', async () => {
  let called = false

  class CallerMiddleware {
    async handle (_, next) {
      called = true
      await next()
    }
  }

  const server = app.make(Server)
  const router = server.router()

  router
    .registerAliasMiddleware('caller', CallerMiddleware)
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

  class FirstCallerMiddleware {
    async handle (_, next) {
      calledOne = true
      await next()
    }
  }

  class SecondCallerMiddleware {
    async handle (_, next) {
      calledTwo = true
      await next()
    }
  }

  const server = app.make(Server)
  const router = server.router()

  router
    .registerAliasMiddleware('caller1', FirstCallerMiddleware)
    .registerAliasMiddleware('caller2', SecondCallerMiddleware)
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
  const server = app.make(Server)

  server.router()
    .middleware('unknown')
    .middleware('another-unkown')
    .post('/name', ({ response }) => response.payload('Supercharge'))

  expect(
    () => server.bootstrap()
  ).toThrow('Route-level middleware "unknown" is not registered in your HTTP kernel')
})

test('returns status 204 for empty responses', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.get('/name', () => '')

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/name')
    .expect(204)
})

test('handles redirects', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.get('/name', ctx => ctx.response.redirect('/login'))

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/name')
    .expect(302)
})

test('throws when returning null as a response', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.get('/name', () => null)

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/name')
    .expect(500)
})

test('throws when returning undefined as a response', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.get('/name', () => null)

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/name')
    .expect(500)
})

test('register route middleware for single route in group', async () => {
  class ChangeStatusMiddleware {
    async handle (ctx, next) {
      await next()
      return ctx.response.status(201)
    }
  }

  const server = app.make(Server)
  const router = server.router()

  router.registerAliasMiddleware('changeStatus', ChangeStatusMiddleware)

  router.group('/prefix', () => {
    router.get('/plain', () => 'plain')
    router.get('/with-middleware', () => 'with-middleware').middleware('changeStatus')
  })

  await server.bootstrap()

  const callback = server.callback()

  await Supertest(callback).get('/prefix/plain').expect(200, 'plain')
  await Supertest(callback).get('/prefix/with-middleware').expect(201, 'with-middleware')
})

test('handle route errors early', async () => {
  class ThrowErrorMiddleware {
    async handle (ctx, next) {
      await next()
      ctx.response.throw(418, 'Should not be reached')
    }
  }

  const server = app.make(Server)
  const router = server.router()

  router.registerAliasMiddleware('throwErrorAfterHandler', ThrowErrorMiddleware)

  router.get('/', () => {
    throw HttpError.badRequest('Validation failed')
  }).middleware('throwErrorAfterHandler')

  await server.bootstrap()

  const response = await Supertest(server.callback())
    .get('')
    .expect(400)

  expect(response.text).toEqual('Validation failed')
})

test('route middleware can handle errors before error handler is invoked', async () => {
  class CatchErrorMiddleware {
    async handle (ctx, next) {
      try {
        await next()
      } catch (error) {
        return ctx.response
          .payload('Error handled by route middleware')
          .status(418)
      }
    }
  }

  const server = app.make(Server)
  const router = server.router()

  router.registerAliasMiddleware('catchError', CatchErrorMiddleware)

  router.get('/', ctx => {
    return ctx.response.throw(400, 'Validation failed')
  }).middleware('catchError')

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/')
    .expect(418, 'Error handled by route middleware')
})

test.run()
