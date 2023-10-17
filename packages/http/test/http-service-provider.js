
import { test } from 'uvu'
import { expect } from 'expect'
import { setupApp } from './helpers/index.js'
import { HttpServiceProvider, Server } from '../dist/index.js'

const app = setupApp()

test('register', async () => {
  const provider = new HttpServiceProvider(app)
  provider.register()

  expect(app.hasBinding('server')).toBe(true)
  expect(app.hasBinding(Server)).toBe(true)
  expect(app.make('server')).toBeInstanceOf(Server)
  expect(app.make(Server)).toBeInstanceOf(Server)
})

test('shutdown', async () => {
  const provider = new HttpServiceProvider(app)
  const server = app.make(Server)

  await server
    .booted(async () => {
      await provider.shutdown()
    })
    .start()
})

test.run()
