'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { setupApp } = require('./helpers')
const { Application } = require('@supercharge/core')
const { HttpServiceProvider } = require('@supercharge/http')
const { SessionServiceProvider, SessionManager } = require('../dist')

test('throws without session config', async () => {
  const app = new Application()
  app.register(new SessionServiceProvider(app))

  expect(() => {
    app.make('session')
  }).toThrow('Missing session configuration file. Make sure the "config/session.ts" file exists.')
})

test('register session service provider', async () => {
  const app = await setupApp()
  app.register(new SessionServiceProvider(app))

  expect(app.make('session') instanceof SessionManager).toBe(true)
})

test('boot the registered session service provider', async () => {
  const app = await setupApp()

  await app
    .register(new HttpServiceProvider(app))
    .register(new SessionServiceProvider(app))
    .boot()

  expect(app.make('session') instanceof SessionManager).toBe(true)

  const Request = app.make('request')
  expect(Request.hasMacro('session')).toBe(true)
  expect(Request.prototype.session).toBeDefined()
})

test.run()
