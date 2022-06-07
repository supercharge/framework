'use strict'

const { expect } = require('expect')
const { test } = require('@japa/runner')
const { setupApp } = require('./helpers')
const { Application } = require('@supercharge/core')
const { SessionServiceProvider, SessionManager } = require('../dist')

test.group('Session Service Provider', async () => {
  test('throws without session config', async () => {
    const app = new Application()
    app.register(new SessionServiceProvider(app))

    expect(() => {
      app.make('session')
    }).toThrow('Missing session configuration file. Make sure the "config/session.ts" file exists.')
  })

  test('register session service provider', async () => {
    const app = await setupApp()

    expect(app.make('session') instanceof SessionManager).toBe(true)
  })

  test('boot the registered session service provider', async () => {
    const app = await setupApp()

    expect(app.make('session') instanceof SessionManager).toBe(true)

    const Request = app.make('request')
    expect(Request.hasMacro('session')).toBe(true)
    expect(Request.prototype.session).toBeDefined()
  })
})
