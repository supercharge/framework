'use strict'

import knex, * as Knex from 'knex'
import MethodMissing from '@supercharge/method-missing'
import { Application, ConfigStore } from '@supercharge/contracts'

interface Connections { [key: string]: Knex }

export class DatabaseManager extends MethodMissing {
  /**
     * The application instance.
     */
  private readonly app: Application

  /**
     * Stores the active database connections, like connections to MySQL or
     * MySQL or
     */
  private readonly connections: Connections

  /**
   * Create a new database manager instance.
   *
   * @param app
   */
  constructor (app: Application) {
    super()

    this.app = app
    this.connections = {}
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
    this.connections[name] = connection

    return this
  }

  /**
   * Determine whether an active connection exists for the given `name`.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  isMissingConnection (name: string = this.defaultConnection()): boolean {
    return !this.connections[name]
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
    if (!this.isMissingConnection(name)) {
      this.setConnection(name, this.createConnection(name))
    }

    return this.connections[name]
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
  protected configuration (connectionName?: string): Knex.Config {
    connectionName = connectionName ?? this.defaultConnection()

    const connections = this.config().get('database.connections')

    if (!connections[connectionName]) {
      throw new Error(`Database connection "${connectionName}" is not configured.`)
    }

    return connections[connectionName]
  }

  /**
   * Returns the default database connection name.
   *
   * @returns {String}
   */
  protected defaultConnection (): string {
    return this.config().get('database.connection')
  }

  /**
   * Pass through all calls to the knex instance.
   *
   * @param {String} methodName
   * @param {Array} args
   *
   * @returns {*}
   */
  __call (methodName: string, args: unknown[]): unknown {
    // @ts-expect-error
    return this.connection()[methodName](...args)
  }
}
