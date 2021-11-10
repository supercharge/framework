'use strict'

const Path = require('path')
const Sinon = require('sinon')
const { test } = require('uvu')
const expect = require('expect')
const { Server } = require('@supercharge/http')
const { HttpKernel, Application } = require('../dist')

const app = new Application(__dirname)
app.config().set('app.key', 1234)

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
  expect(bootstrappers.length).toBe(5)
})

test('fails to bootstrap the HTTP kernel when missing a .env file', async () => {
  await expect(
    HttpKernel.for(app).serverCallback()
  ).rejects.toThrow('Invalid environment file')
})

test('registers and calls booted callbacks', async () => {
  let booted = false

  const kernel = new HttpKernel(app)
  kernel.booted(() => {
    booted = true
  })

  const listenStub = Sinon.stub(kernel, 'listen').returns()
  const bootstrapStub = Sinon.stub(kernel, 'bootstrap').returns()

  await kernel.startServer()
  expect(booted).toBe(true)

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
  const app = Application.createWithAppRoot(Path.resolve(__dirname, 'fixtures'))

  app.config().set('app.key', 1234)
  app.config().set('app.host', 'localhost')
  app.config().set('app.port', 1234)

  const kernel = new HttpKernel(app)

  await kernel.startServer()

  expect(kernel.app().env().get('FOO')).toBe('bar')
  expect(kernel.app().config().has('test.foo')).toBe(true)
  expect(kernel.app().config().get('test.foo')).toBe('bar')
  expect(kernel.app().config().isMissing('ignored.foo')).toBe(true)

  await kernel.stopServer()
})

test('bootstraps only once', async () => {
  const app = Application.createWithAppRoot(Path.resolve(__dirname, 'fixtures'))
  app.config().set('app.key', 1234)

  const bootstrapWithStub = Sinon.stub(app, 'bootstrapWith').returns()

  const kernel = new HttpKernel(app).booted(async () => {
    await kernel.stopServer()
  })

  await kernel.startServer()
  await kernel.startServer()

  expect(bootstrapWithStub.calledOnce).toBe(true)
  bootstrapWithStub.restore()
})

test.run()
