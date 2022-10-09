'use strict'

import { knex, Knex } from 'knex'
import { DatabaseConfig } from '@supercharge/contracts'
import { DatabaseManagerProxy } from './database-manager-proxy'

export class DatabaseManager {
  /**
   * Stores the database configuration object.
   */
  private readonly config: DatabaseConfig

  /**
   * Stores the active database connections, like connections to
   * SQLite, MySQL, MariaDB, PostgreSQL, and so on.
   */
  private readonly connections: Map<string, Knex>

  /**
   * Create a new database manager instance.
   *
   * @param app
   */
  constructor (config: DatabaseConfig) {
    this.config = config
    this.connections = new Map()

    return new Proxy(this, new DatabaseManagerProxy(this))
  }

  /**
   * Assign the given `connection` to the related `name`.
   *
   * @param {String} name
   * @param {Knex} connection
   *
   * @returns {DatabaseManager}
   */
  setConnection (name: string, connection: Knex): this {
    this.connections.set(name, connection)

    return this
  }

  /**
   * Determine whether an active connection exists for the given `name`.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  isMissingConnection (name: string): boolean {
    if (!name) {
      throw new Error('You must provide a database connection "name"')
    }

    return !this.connections.has(name)
  }

  /**
   * Returns an active connection for the given `name`. Returns a connection
   * for the configured default connection name if the name is not present.
   *
   * @param {String} name
   *
   * @returns {Knex}
   */
  connection (name: string = this.defaultConnection()): Knex {
    if (this.isMissingConnection(name)) {
      this.setConnection(name, this.createConnection(name))
    }

    return this.connections.get(name) as Knex
  }

  /**
   * Creates a new knex instance using the given.
   *
   * @returns {Knex}
   */
  protected createConnection (name: string): Knex {
    return knex(
      this.configuration(name)
    )
  }

  /**
   * Returns the configuration for the given `connectionName`.
   *
   * @param {String} connectionName
   *
   * @returns {Knex.Config | String}
   */
  protected configuration (connectionName: string): Knex.Config | string {
    const connection = this.config.connections[connectionName]

    if (!connection) {
      throw new Error(`Database connection "${connectionName}" is not configured.`)
    }

    return connection
  }

  /**
   * Returns the default database connection name.
   *
   * @returns {String}
   */
  protected defaultConnection (): string {
    return this.config.default ?? this.config.connection
  }

  /**
   * This method is used by the `DatabaseManagerProxy` class to dynamically access
   * the knex database connection instance. It calls the related properties or
   * methods when accessing the connection.
   */
  protected __call (): unknown {
    return this.connection()
  }
}
