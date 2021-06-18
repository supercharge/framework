'use strict'

/**
 * @typedef {import('@supercharge/contracts').Database} Database
 */

const { test } = require('tap')
const { DatabaseManager } = require('../dist')
const { Application } = require('@supercharge/core')

const { MYSQL_USER = 'root', MYSQL_PASSWORD = 'secret' } = process.env

test('connects to the database', async t => {
  const db = makeDb()
  console.log(db.schema)
  console.log(db.schema())

  db.sc.schema.createTable(
    app().config().get('database.connections.mysql.connection.database')
  )
})

/**
 * @returns {Database}
 */
function makeDb () {
  return new DatabaseManager(
    app()
  )
}

/**
 * Returns the test application.
 *
 * @returns {Application}
 */
function app () {
  const app = new Application()

  app.config().set('database', {
    connection: 'mysql',

    connections: {
      mysql: {
        client: 'mysql',
        connection: {
          host: '127.0.0.1',
          user: MYSQL_USER,
          password: MYSQL_PASSWORD,
          database: 'supercharge_test'
        }
      }
    }
  })

  return app
}
