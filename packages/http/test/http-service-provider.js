
const { test } = require('uvu')
const { expect } = require('expect')
const { setupApp } = require('./helpers')
const { HttpServiceProvider, Server } = require('../dist')

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
