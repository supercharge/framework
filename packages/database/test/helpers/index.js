'use strict'

const Path = require('node:path')
const Crypto = require('node:crypto')
const Fs = require('node:fs/promises')
const { DatabaseManager } = require('../../dist')
const { Application } = require('@supercharge/core')

exports.makeDb = makeDb
exports.makeApp = makeApp
exports.clearDbDirectory = clearDbDirectory

const databaseDirectory = Path.resolve(__dirname, '..', 'fixtures')

/**
 * @returns {Database}
 */
function makeDb (app, dbDirectory = databaseDirectory) {
  const application = (app || makeApp(undefined, dbDirectory))

  return new DatabaseManager(application.config().get('database'))
}

/**
 * @returns {Database}
 */
async function clearDbDirectory (dbDirectory = databaseDirectory) {
  const sqliteFiles = [].concat(
    await Fs.readdir(dbDirectory)
  ).filter(file => file.endsWith('.sqlite'))

  for (const file of sqliteFiles) {
    await Fs.unlink(Path.join(dbDirectory, file))
  }
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
