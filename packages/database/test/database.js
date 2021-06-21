'use strict'

/**
 * @typedef {import('@supercharge/contracts').Database } Database
 */
const { test } = require('tap')
const { DatabaseManager } = require('../dist')

const { makeDb, makeApp } = require('./helpers')

test('throws for missing connection name', async t => {
  const app = makeApp()

  t.throws(() => {
    new DatabaseManager(app).connection('unavailable connection')
  }, 'Database connection "postgresql" is not configured')
})

test('connects to the database', async t => {
  /**
   * @type {Database}
   */
  const db = makeDb()

  // await db.raw(`
  //   CREATE DATABASE ${makeApp().config().get('database.connections.mysql.connection.database')}
  // `)

  const databaseName = makeApp().config().get('database.connections.mysql.connection.database')

  if (!await db.schema.hasTable(databaseName)) {
    const createTable = await db.schema.createTableIfNotExists(databaseName, table => {
      table.string('name')
    })

    console.log(createTable)
  }

  db.destroy()
})

test('fails to connect to the database', async t => {
  const app = makeApp()
  app.config().set('database.connection', 'postgresql')

  // await t.rejects(async () => {
  /**
     * @type {Database}
     */
  const db = makeDb(app)
  await db.select('*').from('users')
  // })
})
