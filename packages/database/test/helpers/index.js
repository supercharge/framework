'use strict'

const Path = require('path')
const Crypto = require('crypto')
const { DatabaseManager } = require('../../dist')
const { Application } = require('@supercharge/core')

exports.makeDb = makeDb
exports.makeApp = makeApp

/**
 * @returns {Database}
 */
function makeDb (app, dbDirectory) {
  const application = (app || makeApp(undefined, dbDirectory))

  return new DatabaseManager(application.config().get('database'))
}

/**
 * Returns the test application.
 *
 * @returns {Application}
 */
function makeApp (config = {}, dbDirectory) {
  const app = new Application()

  app.config().set('database', {
    connection: 'sqlite',
    connections: {
      ...createSqliteConnectionConfig(dbDirectory),
      ...config.connections
    },
    ...config
  })

  return app
}

/**
 * Returns a SQLite configuration.
 *
 * @returns {Object}
 */
function createSqliteConnectionConfig (dbDirectory) {
  const id = Crypto.randomBytes(28).toString('hex').slice(0, 5)
  const dbPath = dbDirectory || Path.join(__dirname, '../fixtures')
  const dbFile = `${dbPath}/database-${id}.sqlite`

  return {
    sqlite: {
      client: 'sqlite3',
      useNullAsDefault: true,
      connection: {
        filename: dbFile
      }
    }
  }
}
