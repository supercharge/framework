'use strict'

import { Connection } from '.'
import Map from '@supercharge/map'
import { tap } from '@supercharge/goodies'
import { Manager } from '@supercharge/manager'
import { Application } from '@supercharge/contracts'
import { MongodbConnection, MongoDbConfig, MongoDbConnectionConfig, MongodbConnectionResolver } from './contracts'

export class MongodbManager extends Manager implements MongodbConnectionResolver {
  private readonly meta: {
    /**
     * Stores the MongoDB configuration.
     */
    config: MongoDbConfig

    /**
     * Cache for MongoDB connections.
     */
    connections: Map<string, MongodbConnection>
  }

  /**
   * Create a new instance.
   */
  constructor (app: Application, config: MongoDbConfig) {
    super(app)

    this.validateConfig()
    this.meta = { config, connections: new Map() }
  }

  /**
   * Validate the view config.
   *
   * @throws
   */
  private validateConfig (): void {
    this.ensureConfig('mongodb', () => {
      throw new Error('Missing "mongodb" configuration file. Make sure the "config/mongodb.ts" file exists.')
    })

    this.ensureConfig('mongodb.default', () => {
      throw new Error('Missing default MongoDB connection name. Please configure the "default" setting inside of the "config/mongodb.ts" configuration file.')
    })

    this.ensureConfig('mongodb.connections', () => {
      throw new Error('Missing MongoDB connections configuration. Please configure the "connections" setting inside of the "config/mongodb.ts" configuration file.')
    })
  }

  /**
   * Returns the default MongoDB connection name.
   *
   * @returns {String}
   */
  protected defaultDriver (): string {
    return this.defaultConnection()
  }

  /**
   * Returns the default MongoDB connection name.
   *
   * @returns {String}
   */
  protected defaultConnection (): string {
    return this.meta.config.default
  }

  /**
   * Returns the cached MongoDB connections.
   *
   * @returns {String}
   */
  protected connections (): Map<string, MongodbConnection> {
    return this.meta.connections
  }

  /**
   * Boot the connection resolver.
   */
  async boot (): Promise<void> {
    await this.ensureDefaultConnection()
  }

  /**
   * Make sure the default connection is connectable.
   */
  private async ensureDefaultConnection (): Promise<void> {
    await this.connection(
      this.defaultConnection()
    )
  }

  /**
   * Returns a MongoDB connection for the given `name`. Returns the
   * default connection when not providing the `name` parameter.
   *
   * @param {String} name
   *
   * @returns {MongodbConnection}
   */
  async connection (name?: string): Promise<MongodbConnection> {
    const connectionName = this.resolveConnectionName(name)

    if (this.connections().isMissing(connectionName)) {
      await this.createMongodbConnection(connectionName)
    }

    return this.connections().get(connectionName)!
  }

  /**
   * Returns the given connection `name` if it’s not nullish,
   * otherwise returns the default connection name.
   *
   * @param {String} name
   *
   * @returns {String}
   */
  private resolveConnectionName (name?: string): string {
    return name ?? this.defaultConnection()
  }

  /**
   * Create a MongoDB connection for the given .
   *
   * @returns {MongodbConnection}
   */
  protected async createMongodbConnection (name: string): Promise<MongodbConnection> {
    const config = this.meta.config.connections[name]

    if (!config) {
      throw new Error(`Missing MongoDB connection configuration for key "${name}"`)
    }

    const connection = new Connection(
      this.createConnectionUri(config), config.clientOptions
    )

    return tap(connection, async () => {
      this.connections().set(name, await connection.connect())
    })
  }

  /**
   * Returns the connection URL.
   *
   * @param config
   *
   * @returns
   */
  private createConnectionUri (config: MongoDbConnectionConfig): string {
    const { url, host, port, database = '', protocol = 'mongodb' } = config

    if (url) {
      return String(url)
    }

    if (!host) {
      throw new Error('Missing MongoDB host')
    }

    return host && port
      ? `${protocol}://${host}:${port}/${database}`
      : `${protocol}://${host}/${database}`
  }

  /**
   * Closes the connection for the given `name`. Closes
   * the default connection not providing a `name`.
   */
  async disconnect (name?: string): Promise<void> {
    const connectionName = this.resolveConnectionName(name)

    if (this.connections().has(connectionName)) {
      await this.connections().get(connectionName)!.close()
    }
  }

  /**
    * Closes all opened connections.
    */
  async disconnectAll (): Promise<void> {
    for (const connection of this.connections().values()) {
      await connection.disconnect()
    }
  }
}
