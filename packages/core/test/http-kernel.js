'use strict'

const Sinon = require('sinon')
const { test } = require('uvu')
const expect = require('expect')
const { Server } = require('@supercharge/http')
const { HttpKernel, Application } = require('../dist')

const app = new Application(__dirname)
app.config().set('app.key', 1234)

test('static .for(app)', async () => {
  expect(HttpKernel.for(app)).toBeInstanceOf(HttpKernel)
})

test('.server()', async () => {
  expect(
    HttpKernel.for(app).server()
  ).toBeInstanceOf(Server)
})

test('.middleware() is empty by default', async () => {
  expect(
    HttpKernel.for(app).server()
  ).toBeInstanceOf(Server)
})

test('.bootstrappers()', async () => {
  const bootstrappers = HttpKernel.for(app).bootstrappers()
  expect(bootstrappers.length).toBe(5)
})

test('fails to bootstrap the HTTP kernel when missing a .env file', async () => {
  await expect(
    HttpKernel.for(app).serverCallback()
  ).rejects.toThrow('Invalid environment file. Cannot find env file ".env".')
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

test.run()
