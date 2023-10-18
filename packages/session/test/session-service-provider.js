
import { test } from 'uvu'
import { expect } from 'expect'
import { Server } from '@supercharge/http'
import { setupApp } from './helpers/index.js'
import { Application } from '@supercharge/core'
import { SessionServiceProvider, SessionManager, StartSessionMiddleware } from '../dist/index.js'

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

test('registers the StartSession middleware', async () => {
  const app = await setupApp()
  const server = app.make(Server)

  server.app().hasBinding(StartSessionMiddleware)
})

test('boot the registered session service provider', async () => {
  const app = await setupApp()

  expect(app.make('session') instanceof SessionManager).toBe(true)

  const Request = app.make('request')
  expect(Request.hasMacro('session')).toBe(true)
  expect(Request.prototype.session).toBeDefined()
})

test.run()
