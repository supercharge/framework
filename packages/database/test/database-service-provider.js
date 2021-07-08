'use strict'

const { test } = require('tap')
const { makeApp } = require('./helpers')
const { DatabaseServiceProvider, DatabaseManager } = require('../dist')

test('registers DB service provider', async t => {
  const app = makeApp()
  app.register(new DatabaseServiceProvider(app))

  t.not(app.make('db'), null)
  t.not(app.make('db'), undefined)
  t.equal(app.make('db') instanceof DatabaseManager, true)
})
