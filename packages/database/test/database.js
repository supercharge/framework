
import { test } from 'uvu'
import { expect } from 'expect'
import { DatabaseManager } from '../dist/index.js'
import { makeDb, makeApp } from './helpers/index.js'

test('throws for missing connection name', async t => {
  const app = makeApp({
    connection: 'unavailable',
    connections: { mysql: {} }
  })

  const dbConfig = app.config().get('database')

  expect(() => {
    new DatabaseManager(dbConfig).connection()
  }).toThrow('Database connection "unavailable" is not configured')

  expect(() => {
    new DatabaseManager(dbConfig).connection('unavailable')
  }).toThrow('Database connection "unavailable" is not configured')

  expect(() => {
    new DatabaseManager(dbConfig).isMissingConnection()
  }).toThrow()
})

test('throws when not providing a connection while checking for connections', async t => {
  expect(() => {
    new DatabaseManager({}).isMissingConnection()
  }).toThrow('You must provide a database connection "name"')
})

test('connects to the database', async t => {
  const db = makeDb()
  const tableName = 'users'

  if (!await db.schema.hasTable(tableName)) {
    await db.schema.createTable(tableName, table => {
      table.string('name')
    })
  }

  await db.transaction(async trx => {
    await trx(tableName).insert({ name: 'Marcus' })
  })

  if (await db.schema.hasTable(tableName)) {
    await db.schema.dropTable(tableName)
  }

  await db.destroy()
})

test('fails to connect to the database', async () => {
  expect(() => {
    return new DatabaseManager({ connections: {} }).connection('postgres')
  }).toThrow('Database connection "postgres" is not configured')
})

test.run()
