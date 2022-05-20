'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { Route } = require('../dist')
const { isConstructor } = require('@supercharge/classes')

const app = {
  bindings: {},
  make (key) {
    if (isConstructor(key)) {
      // eslint-disable-next-line new-cap
      return new key(this)
    }

    const bindingCallback = this.bindings[key]

    if (bindingCallback) {
      return bindingCallback(this)
    }
  }
}

test('fails for route controller class without .handle() method', async () => {
  class NoopController { }

  const route = new Route(['GET'], '/name', NoopController, app)
  await expect(
    route.run({})
  ).rejects.toThrow('You must implement the "handle" method in controller "NoopController"')
})

test('fails to run route handler for non-function/non-class handler', async () => {
  const route = new Route(['GET'], '/name', 'RouteController', app)
  await expect(
    route.run({})
  ).rejects.toThrow('Invalid route handler. Only controller actions and inline handlers are allowed')
})

test.run()
