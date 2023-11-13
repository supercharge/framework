
import { test } from 'uvu'
import Path from 'node:path'
import { expect } from 'expect'
import { Env } from '@supercharge/env'
import { fileURLToPath } from 'node:url'
import { Config } from '@supercharge/config'
import { Application } from '../dist/index.js'
import { LogManager } from '@supercharge/logging'
import TestServiceProvider from './fixtures/bootstrap/test-service-provider.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = Path.resolve(__dirname, './fixtures')

test('app.env()', async () => {
  const app = Application.createWithAppRoot(__dirname)
  expect(app.env()).toBeInstanceOf(Env)
})

test('app.config()', async () => {
  const app = Application.createWithAppRoot(__dirname)
  expect(app.config()).toBeInstanceOf(Config)
})

test('app.logger()', async () => {
  const app = Application.createWithAppRoot(__dirname)
  expect(app.logger()).toBeInstanceOf(LogManager)
})

test('app.key()', async () => {
  const app = Application.createWithAppRoot(__dirname)
  expect(() => app.key()).toThrow('Missing app key. Please set the APP_KEY environment variable.')

  app.config().set('app.key', 1234)
  expect(app.key()).toBe(1234)
})

test('app.registerBaseBindings()', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.hasBinding('app')).toBe(true)
  expect(app.hasBinding('container')).toBe(true)

  expect(app.hasBinding('env')).toBe(true)
  expect(app.hasBinding('config')).toBe(true)
})

test('app.registerBaseServiceProviders()', async () => {
  const app = Application.createWithAppRoot(__dirname)
  expect(app.hasBinding('logger')).toBe(true)
})

test('app.version()', async () => {
  const app = Application.createWithAppRoot(fixturesPath)
  expect(app.version()).toEqual('1.2.3')
})

test('app.basePath()', async () => {
  const app = Application.createWithAppRoot(__dirname)
  expect(app.basePath()).toEqual(__dirname)
})

test('app.environmentFile()', async () => {
  const app = Application.createWithAppRoot(__dirname)
  expect(app.environmentFile()).toEqual('.env')
})

test('app.loadEnvironmentFrom()', async () => {
  const app = Application
    .createWithAppRoot(__dirname)
    .loadEnvironmentFrom('./fixtures/.env')

  expect(app.environmentFile()).toEqual('./fixtures/.env')
})

test('app.environmentPath() uses appRoot by default', async () => {
  const app = Application.createWithAppRoot(__dirname)
  expect(app.environmentPath()).toEqual(__dirname)
})

test('app.useEnvironmentPath()', async () => {
  const app = Application
    .createWithAppRoot(__dirname)
    .useEnvironmentPath('fixtures')

  expect(app.environmentPath()).toEqual(fixturesPath)
})

test('app.environmentFilePath()', async () => {
  const app = Application
    .createWithAppRoot(__dirname)
    .loadEnvironmentFrom('secrets.env')
    .useEnvironmentPath('fixtures')

  expect(app.environmentFilePath()).toEqual(
    Path.resolve(__dirname, 'fixtures/secrets.env')
  )
})

test('app.configPath()', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.configPath()).toEqual(
    Path.resolve(__dirname, 'config')
  )
})

test('resolves configPath for parameter', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.configPath('service.js')).toEqual(
    Path.resolve(__dirname, 'config/service.js')
  )
})

test('app.publicPath()', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.publicPath()).toEqual(
    Path.resolve(__dirname, 'public')
  )

  expect(app.publicPath('test')).toEqual(
    Path.resolve(__dirname, 'public/test')
  )

  expect(app.publicPath('foo/bar')).toEqual(
    Path.resolve(__dirname, 'public/foo/bar')
  )

  expect(app.publicPath('foo', 'bar')).toEqual(
    Path.resolve(__dirname, 'public/foo/bar')
  )
})

test('resolves publicPath for parameter', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.publicPath('assets/font.woff2')).toEqual(
    Path.resolve(__dirname, 'public/assets/font.woff2')
  )
})

test('app.resourcePath()', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.resourcePath()).toEqual(
    Path.resolve(__dirname, 'resources')
  )
})

test('resolves resourcePath for parameter', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.resourcePath('views/mails/test.hbs')).toEqual(
    Path.resolve(__dirname, 'resources/views/mails/test.hbs')
  )
})

test('app.storagePath()', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.storagePath()).toEqual(
    Path.resolve(__dirname, 'storage')
  )
})

test('resolves storagePath for parameter', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.storagePath('cache/file.txt')).toEqual(
    Path.resolve(__dirname, 'storage/cache/file.txt')
  )
})

test('app.databasePath()', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.databasePath()).toEqual(
    Path.resolve(__dirname, 'database')
  )
})

test('resolves databasePath for parameter', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.databasePath('migrations/file.sql')).toEqual(
    Path.resolve(__dirname, 'database/migrations/file.sql')
  )
})

test('calls booting callbacks before booting service providers', async () => {
  let called = false

  const app = Application.createWithAppRoot(__dirname).booting(() => {
    called = true
  })

  await app.bootstrapWith([])
  expect(called).toBe(true)
})

test('app.isRunningInConsole()', async () => {
  const app = Application.createWithAppRoot(__dirname)

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
    .createWithAppRoot(__dirname)
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
    .createWithAppRoot(__dirname)
    .register(new CustomServiceProvider())

  // 'stopped' is bound in the "register" method of the custom provider
  let stopped = app.make('stopped')
  expect(stopped).toBe(false)

  await app.shutdown()

  // 'stopped' is bound in the "register" method of the custom provider
  stopped = app.make('stopped')
  expect(stopped).toBe(true)
})

test.run()
