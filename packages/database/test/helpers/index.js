
import Path from 'node:path'
import Crypto from 'node:crypto'
import Fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Application } from '@supercharge/core'
import { DatabaseManager } from '../../dist/index.js'

const databaseDirectory = fileURLToPath(import.meta.resolve('./../fixtures'))

/**
 * @returns {Database}
 */
export function makeDb (app, dbDirectory = databaseDirectory) {
  const application = (app || makeApp(undefined, dbDirectory))

  return new DatabaseManager(application.config().get('database'))
}

/**
 * @returns {Database}
 */
export async function clearDbDirectory (dbDirectory = databaseDirectory) {
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
export function makeApp (config = {}, dbDirectory) {
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
  const dbPath = dbDirectory || fileURLToPath(import.meta.resolve('./../fixtures'))
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
