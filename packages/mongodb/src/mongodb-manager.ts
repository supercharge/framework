'use strict'

import { Connection } from '.'
import { Manager } from '@supercharge/manager'
import { Application } from '@supercharge/contracts'
import { MongodbManagerContract } from './contracts/mongodb-manager-contract'
import { MongodbConnection, MongoDbConfig, MongoDbConnectionConfig } from './contracts'

export class MongodbManager extends Manager implements MongodbManagerContract {
  private readonly meta: {
    config: MongoDbConfig
  }

  constructor (app: Application, config: MongoDbConfig) {
    super(app)

    this.validateConfig()
    this.meta = { config }
  }

  /**
   * Validate the view config.
   *
   * @throws
   */
  private validateConfig (): void {
    this.ensureConfig('mongodb', () => {
      throw new Error('Missing mongodb configuration file. Make sure the "config/mongodb.ts" file exists.')
    })

    this.ensureConfig('mongodb.default', () => {
      throw new Error('Missing default MongoDB connection name. Please configure the "default" setting inside of the "config/mongodb.ts" configuration file.')
    })
  }

  /**
   * Returns the default MongoDB driver name.
   *
   * @returns {String}
   */
  protected defaultDriver (): string {
    return this.meta.config.default
  }

  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   *
   * @param {String} name
   *
   * @returns {ViewEngine}
   */
  connection (): MongodbConnection
  connection (name: string): MongodbConnection
  connection (name?: any): MongodbConnection {
    // TODO cache connections

    return this.createMongodbConnection(
      this.meta.config.connections[name] ?? this.meta.config.connections[this.defaultDriver()]
    )
  }

  /**
   * Create a MongoDB connection for the given .
   *
   * @returns {FileLogger}
   */
  protected createMongodbConnection (config: MongoDbConnectionConfig): MongodbConnection {
    return new Connection(config)
  }
}
