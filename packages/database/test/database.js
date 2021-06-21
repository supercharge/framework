'use strict'

/**
 * @typedef {import('@supercharge/contracts').Database } Database
 */
const { test } = require('tap')
const { DatabaseManager } = require('../dist')

const { makeDb, makeApp } = require('./helpers')

test('throws for missing connection name', async t => {
  const app = makeApp({
    connection: 'unavailable',
    connections: { mysql: {} }
  })

  t.throws(() => {
    new DatabaseManager(app).connection()
  }, 'Database connection "unavailable" is not configured')

  t.throws(() => {
    new DatabaseManager(app).connection('unavailable')
  }, 'Database connection "unavailable" is not configured')

  t.throws(() => {
    new DatabaseManager(app).isMissingConnection()
  })
})

test('throws when not providing a connection while checking for connections', async t => {
  t.throws(() => {
    new DatabaseManager().isMissingConnection()
  })
})

test('connects to the database', async t => {
  /**
   * @type {Database}
   */
  const db = makeDb()
  const tableName = 'users'

  if (!await db.schema.hasTable(tableName)) {
    await db.schema.createTable(tableName, table => {
      table.string('name')
    })

    await db(tableName).insert({ name: 'Marcus' })
    const users = await db.select('*').from(tableName)
    t.same(users, [{ name: 'Marcus' }])
  }

  db.destroy()
})

test('fails to connect to the database', async t => {
  t.throws(() => {
    return new DatabaseManager(makeApp()).connection('postgres')
  })
})
