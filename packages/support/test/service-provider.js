'use strict'

const Path = require('path')
const { test } = require('uvu')
const { expect } = require('expect')
const { ServiceProvider } = require('../dist')

let config = {}

const appMock = {
  config () {
    return {
      all () {
        return config
      },
      get (key) {
        return config[key]
      },
      set (key, value) {
        config[key] = value
        return this
      },
      has (key) {
        return !!this.get(key)
      }
    }
  }
}

test.before.each(() => {
  config = {}
})

test('provider.app()', () => {
  const serviceProvider = new ServiceProvider(appMock)
  expect(serviceProvider.app()).toBe(appMock)
})

test('provider.register()', () => {
  const serviceProvider = new TestServiceProvider(appMock)

  serviceProvider.register()

  expect(serviceProvider.calledRegister).toBe(true)
})

test('provider.boot()', async () => {
  const serviceProvider = new TestServiceProvider(appMock)

  await serviceProvider.boot()

  expect(serviceProvider.calledBoot).toBe(true)
})

test('provider.booting()', () => {
  const serviceProvider = new ServiceProvider(appMock)

  function bootingCallback () {}

  serviceProvider.booting(bootingCallback)
  expect(serviceProvider.bootingCallbacks()).toEqual([bootingCallback])
})

test('provider.booted()', () => {
  const serviceProvider = new ServiceProvider(appMock)

  function bootedCallback () {}

  serviceProvider.booted(bootedCallback)
  expect(serviceProvider.bootedCallbacks()).toEqual([bootedCallback])
})

test('provider.callBootingCallbacks()', async () => {
  const serviceProvider = new ServiceProvider(appMock)

  let booting = false

  serviceProvider.booting(() => {
    booting = true
  })

  serviceProvider.callBootingCallbacks()

  expect(booting).toBe(true)
})

test('provider.callBootedCallbacks()', async () => {
  const serviceProvider = new ServiceProvider(appMock)

  let booted = false

  serviceProvider.booted(() => {
    booted = true
  })

  serviceProvider.callBootedCallbacks()

  expect(booted).toBe(true)
})

test('provider.mergeConfigFrom()', async () => {
  const serviceProvider = new ServiceProvider(appMock)

  serviceProvider.mergeConfigFrom(
    Path.resolve(__dirname, 'fixtures', 'test-config.js'), 'test'
  )

  expect(serviceProvider.config().has('test')).toBe(true)
})

test('provider.mergeConfigFrom() throws for unavailable file', async () => {
  const serviceProvider = new ServiceProvider(appMock)

  expect(() => {
    serviceProvider.mergeConfigFrom(
      Path.resolve(__dirname, 'fixtures', 'unavailable.js'), 'test'
    )
  }).toThrow()

  expect(serviceProvider.config().all()).toEqual({})
  expect(serviceProvider.config().has('test')).toBe(false)
})

test.run()

class TestServiceProvider extends ServiceProvider {
  constructor (app) {
    super(app)

    this.calledBoot = false
    this.calledRegister = false
  }

  register () {
    super.register()

    this.calledRegister = true
  }

  async boot () {
    await super.boot()

    this.calledBoot = true
  }
}
