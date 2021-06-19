'use strict'

/**
 * @typedef {import('@supercharge/contracts').Database} Database
 */

const { test } = require('tap')
const { makeDb, makeApp } = require('./helpers')

test('connects to the database', async t => {
  const db = makeDb()

  db.schema.createTable(
    makeApp().config().get('database.connections.mysql.connection.database')
  )
})
