'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { HttpServiceProvider, Request, Response, Router, Server } = require('../dist')

const app = {
  bindings: {},
  singletons: {},
  resolvedBindings: {},
  hasBinding (key) {
    return !!this.bindings[key] || !!this.singletons[key]
  },
  alias () {
    return this
  },
  make (key) {
    if (key === 'request') {
      return Request
    }

    if (key === 'response') {
      return Response
    }

    if (key === 'route') {
      return new Router(this)
    }

    if (this.resolvedBindings[key]) {
      return this.resolvedBindings[key]
    }

    const singletonCallback = this.singletons[key]

    if (singletonCallback) {
      const value = singletonCallback(this)
      this.resolvedBindings[key] = value
      return value
    }

    const bindingCallback = this.bindings[key]

    if (bindingCallback) {
      return bindingCallback(this)
    }
  },
  singleton (key, bindingCallback) {
    this.singletons[key] = bindingCallback

    return this
  },
  key () {
    return '1234'
  },
  logger () {
    return {
      info () {}
    }
  },
  config () {
    return {
      get () {}
    }
  }
}

test('register', async () => {
  const provider = new HttpServiceProvider(app)
  provider.register()

  expect(app.hasBinding('server')).toBe(true)
  expect(app.make('server')).toBeInstanceOf(Server)
})

test('shutdown', async () => {
  const provider = new HttpServiceProvider(app)
  const server = app.make('server')

  await server
    .booted(async () => {
      await provider.shutdown()
    })
    .start()
})

test.run()
