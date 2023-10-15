
const { test } = require('uvu')
const { expect } = require('expect')
const { makeApp } = require('./helpers')
const { DatabaseServiceProvider, DatabaseManager } = require('../dist')

test('registers DB service provider', async t => {
  const app = makeApp()
  app.register(new DatabaseServiceProvider(app))

  expect(app.make('db')).not.toBeNull()
  expect(app.make('db')).not.toBeUndefined()
  expect(app.make('db')).toBeInstanceOf(DatabaseManager)
})

test.run()
