
const { test } = require('uvu')
const { expect } = require('expect')
const { makeApp } = require('./helpers')
const { Application } = require('@supercharge/application')
const { ViewServiceProvider, ViewManager } = require('../dist')

test('throws without view config', async () => {
  const app = new Application()
  app.register(new ViewServiceProvider(app))

  expect(() => {
    app.make('view')
  }).toThrow('Missing view configuration file. Make sure the "config/view.ts" file exists.')
})

test('register view service provider', async () => {
  const app = makeApp()
  app.register(new ViewServiceProvider(app))

  expect(app.make('view') instanceof ViewManager).toBe(true)
})

test('boot the registered view service provider', async () => {
  const app = makeApp()

  await app
    .register(new ViewServiceProvider(app))
    .bind('response', () => {
      return {
        macro () { }
      }
    })
    .boot()

  expect(app.make('view') instanceof ViewManager).toBe(true)
})

test.run()
