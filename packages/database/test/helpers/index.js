'use strict'

const { DatabaseManager } = require('../../dist')
const { Application } = require('@supercharge/core')

const {
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = 'secret',
  POSTGRES_USER = 'root',
  POSTGRES_PASSWORD = 'secret'
} = process.env

exports.makeDb = makeDb
exports.makeApp = makeApp

/**
 * @returns {Database}
 */
function makeDb (app) {
  return new DatabaseManager(
    app || makeApp()
  )
}

/**
 * Returns the test application.
 *
 * @returns {Application}
 */
function makeApp (config = {}) {
  const app = new Application()

  app.config().set('database', {
    ...config,
    connection: 'mysql',
    connections: createMySqlConnectionConfig()
  })

  return app
}

/**
 * Returns a MySQL configuration.
 *
 * @returns {Object}
 */
function createMySqlConnectionConfig () {
  return {
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
}

/**
 * Returns a PostgreSQL configuration.
 *
 * @returns {Object}
 */
function createPostgresConnectionConfig () {
  return {
    mysql: {
      client: 'pg',
      connection: {
        host: '127.0.0.1',
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: 'supercharge_test'
      }
    }
  }
}
