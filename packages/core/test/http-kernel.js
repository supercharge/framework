
import Sinon from 'sinon'
import { test } from 'uvu'
import Path from 'node:path'
import { expect } from 'expect'
import Supertest from 'supertest'
import MockedEnv from 'mocked-env'
import { fileURLToPath } from 'node:url'
import { Server } from '@supercharge/http'
import { HttpKernel, Application, ErrorHandler } from '../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const appRootPath = Path.resolve(__dirname, './fixtures')

let app = createApp()

function createApp () {
  const app = Application
    .createWithAppRoot(appRootPath)
    .withErrorHandler(ErrorHandler)
    .bind('view', () => {
    // empty view mock
    })

  app.config().set('app.key', 1234)
  app.config().set('http', {
    host: 'localhost',
    port: 1234,
    cookie: {}
  })

  return app
}

test.before.each(() => {
  app = createApp()
})

test('static .for(app)', async () => {
  expect(HttpKernel.for(app)).toBeInstanceOf(HttpKernel)
  expect(HttpKernel.for(app).app()).toBeInstanceOf(Application)
})

test('.server()', async () => {
  expect(
    HttpKernel.for(app).server()
  ).toBeInstanceOf(Server)
})

test('.middleware() is empty by default', async () => {
  expect(
    HttpKernel.for(app).middleware()
  ).toEqual([])
})

test('.bootstrappers()', async () => {
  const bootstrappers = HttpKernel.for(app).bootstrappers()
  expect(bootstrappers.length).toBe(6)
})

test('fails to bootstrap the HTTP kernel when missing a .env file', async () => {
  app.loadEnvironmentFrom('not-existing.env')

  await expect(
    HttpKernel.for(app).serverCallback()
  ).rejects.toThrow('Invalid environment file. Cannot find env file')
})

test('loads specific environment from .env.testing file because of NODE_ENV=testing', async () => {
  const restoreEnv = MockedEnv({ restore: true })

  const env = app.env().get('NODE_ENV')
  app.env().set('NODE_ENV', 'testing')

  await HttpKernel.for(app).bootstrap()

  expect(app.env().get('TESTING')).toEqual('set-when-loading-env-testing')
  expect(app.env().get('OVERWRITE')).toEqual('1')

  app.env().set('NODE_ENV', env)

  restoreEnv()
})

test('registers and calls booted callbacks', async () => {
  let booted = false

  const kernel = new HttpKernel(app).booted(() => {
    booted = true
  })

  const listenStub = Sinon.stub(kernel, 'listen').returns()
  const bootstrapStub = Sinon.stub(kernel, 'bootstrap').returns()

  await kernel.startServer()
  expect(booted).toBe(true)

  await kernel.stopServer()

  listenStub.restore()
  bootstrapStub.restore()
})

test('calls register when creating the HttpKernel instance', async () => {
  class CustomHttpKernel extends HttpKernel {
    register () {
      this
        .booted(() => {})
        .booted(() => {})
    }
  }

  const kernel = new CustomHttpKernel(app)
  expect(kernel.bootedCallbacks().length).toBe(2)
})

test('bootstrap and .startServer()', async () => {
  const kernel = new HttpKernel(app)
  const listenStub = Sinon.stub(kernel, 'listen').returns()

  await kernel.startServer()

  expect(kernel.isBootstrapped()).toBe(true)
  expect(kernel.app().env().get('FOO')).toBe('bar')
  expect(kernel.app().env().get('OVERWRITE')).toBe('0')
  expect(kernel.app().config().has('test.foo')).toBe(true)
  expect(kernel.app().config().get('test.foo')).toBe('bar')
  expect(kernel.app().config().isMissing('ignored.foo')).toBe(true)

  await kernel.stopServer()
  listenStub.restore()
})

test('register middleware', async () => {
  class TestMiddleware { handle () {} }

  class CustomHttpKernel extends HttpKernel {
    middleware () {
      return [
        TestMiddleware
      ]
    }

    routeMiddleware () {
      return {
        test: class RouteMiddleware { handle () {} }
      }
    }
  }

  const kernel = new CustomHttpKernel(app)
  const listenStub = Sinon.stub(kernel, 'listen').returns()

  await kernel.startServer()

  expect(kernel.server().router().hasMiddleware('test')).toBe(true)
  expect(kernel.server().router().hasMiddleware(TestMiddleware)).toBe(false) // it’s a global middleware, not registered to the router but for all routes

  await kernel.stopServer()
  listenStub.restore()
})

test('bootstraps only once', async () => {
  const bootstrapWithStub = Sinon.stub(app, 'bootstrapWith').returns()

  const kernel = new HttpKernel(app).booted(async () => {
    await kernel.stopServer()
  })

  const listenStub = Sinon.stub(kernel, 'listen').returns()

  await kernel.startServer()
  await kernel.startServer()

  expect(bootstrapWithStub.calledOnce).toBe(true)

  bootstrapWithStub.restore()
  listenStub.restore()
})

test('.serverCallback()', async () => {
  const app = createApp()
  const kernel = new HttpKernel(app)

  kernel.server().use(({ request, response }) => {
    return response.payload({
      query: request.query().all()
    })
  })

  await Supertest(
    await kernel.serverCallback()
  )
    .get('/?name=Supercharge')
    .expect(200, { query: { name: 'Supercharge' } })

  await Supertest(
    await kernel.serverCallback()
  )
    .get('/?foo=bar')
    .expect(200, { query: { foo: 'bar' } })
})

test.run()
