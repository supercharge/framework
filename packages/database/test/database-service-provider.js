
import { test } from 'uvu'
import { expect } from 'expect'
import { makeApp } from './helpers/index.js'
import { DatabaseServiceProvider, DatabaseManager } from '../dist/index.js'

test('registers DB service provider', async t => {
  const app = makeApp()
  app.register(new DatabaseServiceProvider(app))

  expect(app.make('db')).not.toBeNull()
  expect(app.make('db')).not.toBeUndefined()
  expect(app.make('db')).toBeInstanceOf(DatabaseManager)
})

test.run()
