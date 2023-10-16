
import { expect } from 'expect'
import { test } from 'node:test'
import { Env } from '@supercharge/env'
import { Config } from '@supercharge/config'
import { Application } from '../dist/index.js'
import { LogManager } from '@supercharge/logging'
import TestServiceProvider from './fixtures/bootstrap/test-service-provider.js'

const appRootPath = import.meta.resolve('.')
const fixturesPath = import.meta.resolve('./fixtures')

test('app.env()', async () => {
  const app = Application.createWithAppRoot(appRootPath)
  expect(app.env()).toBeInstanceOf(Env)
})

test('app.config()', async () => {
  const app = Application.createWithAppRoot(appRootPath)
  expect(app.config()).toBeInstanceOf(Config)
})

test('app.logger()', async () => {
  const app = Application.createWithAppRoot(appRootPath)
  expect(app.logger()).toBeInstanceOf(LogManager)
})

test('app.key()', async () => {
  const app = Application.createWithAppRoot(appRootPath)
  expect(() => app.key()).toThrow('Missing app key. Please set the APP_KEY environment variable.')

  app.config().set('app.key', 1234)
  expect(app.key()).toBe(1234)
})

test('app.registerBaseBindings()', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.hasBinding('app')).toBe(true)
  expect(app.hasBinding('container')).toBe(true)

  expect(app.hasBinding('env')).toBe(true)
  expect(app.hasBinding('config')).toBe(true)
})

test('app.registerBaseServiceProviders()', async () => {
  const app = Application.createWithAppRoot(appRootPath)
  expect(app.hasBinding('logger')).toBe(true)
})

test('app.version()', async () => {
  const app = Application.createWithAppRoot(fixturesPath)
  expect(app.version()).toEqual('1.2.3')
})

test('app.basePath()', async () => {
  const app = Application.createWithAppRoot(appRootPath)
  expect(app.basePath()).toEqual(appRootPath)
})

test('app.environmentFile()', async () => {
  const app = Application.createWithAppRoot(appRootPath)
  expect(app.environmentFile()).toEqual('.env')
})

test('app.loadEnvironmentFrom()', async () => {
  const app = Application
    .createWithAppRoot(appRootPath)
    .loadEnvironmentFrom('./fixtures/.env')

  expect(app.environmentFile()).toEqual('./fixtures/.env')
})

test('app.environmentPath() uses appRoot by default', async () => {
  const app = Application.createWithAppRoot(appRootPath)
  expect(app.environmentPath()).toEqual(appRootPath)
})

test('app.useEnvironmentPath()', async () => {
  const app = Application
    .createWithAppRoot(appRootPath)
    .useEnvironmentPath('fixtures')

  expect(app.environmentPath()).toEqual(fixturesPath)
})

test('app.environmentFilePath()', async () => {
  const app = Application
    .createWithAppRoot(appRootPath)
    .loadEnvironmentFrom('secrets.env')
    .useEnvironmentPath('fixtures')

  expect(app.environmentFilePath()).toEqual(
    import.meta.resolve('./fixtures/secrets.env')
  )
})

test('app.configPath()', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.configPath()).toEqual(
    import.meta.resolve('./config')
  )
})

test('resolves configPath for parameter', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.configPath('service.js')).toEqual(
    import.meta.resolve('./config/service.js')
  )
})

test('app.publicPath()', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.publicPath()).toEqual(
    import.meta.resolve('./public')
  )

  expect(app.publicPath('test')).toEqual(
    import.meta.resolve('./public/test')
  )

  expect(app.publicPath('foo/bar')).toEqual(
    import.meta.resolve('./public/foo/bar')
  )

  expect(app.publicPath('foo', 'bar')).toEqual(
    import.meta.resolve('./public/foo/bar')
  )
})

test('resolves publicPath for parameter', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.publicPath('assets/font.woff2')).toEqual(
    import.meta.resolve('./public/assets/font.woff2')
  )
})

test('app.resourcePath()', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.resourcePath()).toEqual(
    import.meta.resolve('./resources')
  )
})

test('resolves resourcePath for parameter', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.resourcePath('views/mails/test.hbs')).toEqual(
    import.meta.resolve('./resources/views/mails/test.hbs')
  )
})

test('app.storagePath()', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.storagePath()).toEqual(
    import.meta.resolve('./storage')
  )
})

test('resolves storagePath for parameter', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.storagePath('cache/file.txt')).toEqual(
    import.meta.resolve('./storage/cache/file.txt')
  )
})

test('app.databasePath()', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.databasePath()).toEqual(
    import.meta.resolve('./database')
  )
})

test('resolves databasePath for parameter', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.databasePath('migrations/file.sql')).toEqual(
    import.meta.resolve('./database/migrations/file.sql')
  )
})

test('calls booting callbacks before booting service providers', async () => {
  let called = false

  const app = Application.createWithAppRoot(appRootPath).booting(() => {
    called = true
  })

  await app.bootstrapWith([])
  expect(called).toBe(true)
})

test('app.isRunningInConsole()', async () => {
  const app = Application.createWithAppRoot(appRootPath)

  expect(app.isRunningInConsole()).toBe(false)

  app.markAsRunningInConsole()
  expect(app.isRunningInConsole()).toBe(true)
})

test('registerConfiguredProviders', async () => {
  const app = Application.createWithAppRoot(fixturesPath)
  await app.registerConfiguredProviders()

  expect(
    app.serviceProviders().has(provider => {
      return provider instanceof TestServiceProvider
    })
  ).toBe(true)
})

test('app.withCustomErrorHandler()', async () => {
  class CustomErrorHandler { }

  const app = Application
    .createWithAppRoot(appRootPath)
    .withErrorHandler(CustomErrorHandler)

  expect(app.make('error.handler')).toBeInstanceOf(CustomErrorHandler)
})

test('boot', async () => {
  const app = Application.createWithAppRoot(fixturesPath)

  class BootAppBootstrapper {
    async bootstrap (app) {
      await app.registerConfiguredProviders()
      await app.boot()
    }
  }

  await app.bootstrapWith(BootAppBootstrapper)

  /**
     * The 'test-register' and 'test-boot' bindings are registered inside
     * of the fixtures/bootstrap/test-service-provider.js fixture file.
     */
  const registered = app.make('test-register')
  expect(registered).toBe(true)

  const booted = app.make('test-boot')
  expect(booted).toBe(true)
})

test('shutdown', async () => {
  class CustomServiceProvider {
    constructor () {
      this.stopped = false
    }

    register (app) {
      app.bind('stopped', () => this.stopped)
    }

    async shutdown () {
      this.stopped = true
    }
  }

  const app = Application
    .createWithAppRoot(appRootPath)
    .register(new CustomServiceProvider())

  // 'stopped' is bound in the "register" method of the custom provider
  let stopped = app.make('stopped')
  expect(stopped).toBe(false)

  await app.shutdown()

  // 'stopped' is bound in the "register" method of the custom provider
  stopped = app.make('stopped')
  expect(stopped).toBe(true)
})
