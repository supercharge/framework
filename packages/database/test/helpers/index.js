'use strict'

const { DatabaseManager } = require('../../dist')
const { Application } = require('@supercharge/core')

const { MYSQL_USER = 'root', MYSQL_PASSWORD = 'secret' } = process.env

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
    connection: 'mysql',
    connections: {
      ...createMySqlConnectionConfig(),
      ...config.connections
    },
    ...config
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
