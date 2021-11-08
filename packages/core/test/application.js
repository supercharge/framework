'use strict'

const Path = require('path')
const { test } = require('uvu')
const expect = require('expect')
const { Application } = require('../dist')
const { Env } = require('@supercharge/env')
const { Config } = require('@supercharge/config')
const { LogManager } = require('@supercharge/logging')

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

test.run()
