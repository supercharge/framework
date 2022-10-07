'use strict'

const Path = require('path')
const Sinon = require('sinon')
const { test } = require('uvu')
const { expect } = require('expect')
const Supertest = require('supertest')
const { Server } = require('@supercharge/http')
const { HttpKernel, Application, ErrorHandler } = require('../dist')

const app = createApp()

function createApp () {
  const app = Application
    .createWithAppRoot(Path.resolve(__dirname, 'fixtures'))
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

test.skip('fails to bootstrap the HTTP kernel when missing a .env file', async () => {
  await expect(
    HttpKernel.for(app).serverCallback()
  ).rejects.toThrow('Invalid environment file')
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

  expect(kernel.app().env().get('FOO')).toBe('bar')
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
