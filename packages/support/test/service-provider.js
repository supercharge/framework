
import { test } from 'uvu'
import Path from 'node:path'
import { expect } from 'expect'
import { fileURLToPath } from 'node:url'
import { ServiceProvider } from '../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))

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

test('provider.shutdown()', async () => {
  const serviceProvider = new TestServiceProvider(appMock)

  await serviceProvider.shutdown()

  expect(serviceProvider.calledShutdown).toBe(true)
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

  await serviceProvider.mergeConfigFrom(
    Path.resolve(__dirname, './fixtures/test-config.js'), 'test'
  )

  expect(serviceProvider.config().has('test')).toBe(true)
})

test('provider.mergeConfigFrom() throws for file without default export', async () => {
  const serviceProvider = new ServiceProvider(appMock)
  const filePath = Path.resolve(__dirname, './fixtures/test-config-without-default-export.js')

  await expect(
    serviceProvider.mergeConfigFrom(filePath, 'test')
  ).rejects.toThrow(`Missing "export default" in module "${filePath}"`)

  expect(serviceProvider.config().all()).toEqual({})
  expect(serviceProvider.config().has('test')).toBe(false)
})

test('provider.mergeConfigFrom() throws for unavailable file', async () => {
  const serviceProvider = new ServiceProvider(appMock)

  await expect(
    serviceProvider.mergeConfigFrom(
      Path.resolve('./fixtures/unavailable.js'), 'test'
    )
  ).rejects.toThrow('Cannot find module')

  expect(serviceProvider.config().all()).toEqual({})
  expect(serviceProvider.config().has('test')).toBe(false)
})

test.run()

class TestServiceProvider extends ServiceProvider {
  constructor (app) {
    super(app)

    this.calledBoot = false
    this.calledRegister = false
    this.calledShutdown = false
  }

  register () {
    super.register()

    this.calledRegister = true
  }

  async boot () {
    await super.boot()

    this.calledBoot = true
  }

  async shutdown () {
    await super.shutdown()

    this.calledShutdown = true
  }
}
