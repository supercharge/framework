'use strict'

const Path = require('path')
const Sinon = require('sinon')
const { test } = require('uvu')
const expect = require('expect')
const { Env } = require('@supercharge/env')
const { Config } = require('@supercharge/config')
const { LogManager } = require('@supercharge/logging')
const { Application, ErrorHandler } = require('../dist')

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

  expect(app.hasBinding('route')).toBe(true)
  expect(app.hasBinding('router')).toBe(true)
})

test('app.version()', async () => {
  const app = Application.createWithAppRoot(Path.resolve(__dirname, 'fixtures'))

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
  const app = Application
    .createWithAppRoot(__dirname)

  expect(app.environmentPath()).toEqual(__dirname)
})

test('app.useEnvironmentPath()', async () => {
  const app = Application
    .createWithAppRoot(__dirname)
    .useEnvironmentPath('fixtures')

  expect(app.environmentPath()).toEqual(
    Path.resolve(__dirname, 'fixtures')
  )
})

test('app.environmentFilePath()', async () => {
  const app = Application
    .createWithAppRoot(__dirname)
    .loadEnvironmentFrom('secrets.env')
    .useEnvironmentPath('fixtures')

  expect(app.environmentFilePath()).toEqual(
    Path.resolve(__dirname, 'fixtures', 'secrets.env')
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

test('app.registerConfiguredProviders()', async () => {
  const app = Application.createWithAppRoot(__dirname)

  let called = false

  class TestProvider {
    register () {
      called = true
    }
  }

  const loadConfiguredProvidersStub = Sinon
    .stub(app, 'loadConfiguredProviders')
    .returns([TestProvider])

  await app.registerConfiguredProviders()
  expect(called).toBe(true)
  expect(
    !!app.serviceProviders().find(provider => {
      return provider instanceof TestProvider
    })
  ).toBe(true)

  loadConfiguredProvidersStub.restore()
})

test('app.withCustomErrorHandler()', async () => {
  class CustomErrorHandler extends ErrorHandler { }

  const app = Application
    .createWithAppRoot(__dirname)
    .withErrorHandler(CustomErrorHandler)

  expect(app.make('error.handler')).toBeInstanceOf(CustomErrorHandler)
})

test.run()