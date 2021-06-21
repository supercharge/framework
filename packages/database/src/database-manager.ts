'use strict'

import knex, * as Knex from 'knex'
import { DatabaseManagerProxy } from './database-manager-proxy'
import { Application, ConfigStore } from '@supercharge/contracts'

export class DatabaseManager {
  /**
     * The application instance.
     */
  private readonly app: Application

  /**
     * Stores the active database connections, like connections to MySQL or
     * MySQL or
     */
  private readonly connections: Map<string, Knex>

  /**
   * Create a new database manager instance.
   *
   * @param app
   */
  constructor (app: Application) {
    this.app = app
    this.connections = new Map()

    return new Proxy(this, new DatabaseManagerProxy(this))
  }

  /**
   * Returns the config store.
   *
   * @returns {ConfigStore}
   */
  config (): ConfigStore {
    return this.app.config()
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
      throw new Error('You must provide a connection "name"')
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
   * @returns
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
   * @returns {Object}
   */
  protected configuration (connectionName: string): Knex.Config {
    const connection = this.config().get(`database.connections.${connectionName}`)

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
    return this.config().get('database.connection')
  }

  protected __call (): unknown {
    return this.connection()
  }
}
