'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { Route } = require('../dist')
const { setupApp } = require('./helpers')

let app = setupApp()

test.before.each(() => {
  app = setupApp()
})

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
