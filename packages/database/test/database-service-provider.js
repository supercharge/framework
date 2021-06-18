'use strict'

const { test } = require('tap')
const { Application } = require('@supercharge/core')
const { DatabaseManager, DatabaseServiceProvider } = require('../dist')

test('registers DB service provider', async t => {
  const app = new Application()
  app.register(new DatabaseServiceProvider(app))

  const db = app.make('db')
  t.same(db, new DatabaseManager(app))
})
