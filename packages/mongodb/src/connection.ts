'use strict'

import { Model } from './model'
import { Arr } from '@supercharge/arrays'
import { Collect } from '@supercharge/collections'
import { ConnectionState, MongodbConnection } from './contracts'
import { MongoDbConnectionConfig } from './contracts/config-contract'
import { Collection, CollectionInfo, ListDatabasesResult, MongoClient } from 'mongodb'

export class Connection implements MongodbConnection {
  /**
   * Stores the database details.
   */
  private readonly meta: {
    /**
     * An array of registered models.
     */
    models: Array<typeof Model>

    /**
     * The MongoDB client instance.
     */
    mongoClient: MongoClient

    /**
     * The MongoDB client connection state.
     */
    state: ConnectionState
  }

  /**
   * Create a new database instance.
   */
  constructor (config: MongoDbConnectionConfig) {
    this.meta = {
      models: [],
      state: 'disconnected',
      mongoClient: this.createMongoClient(config)
    }
  }

  private createMongoClient (config: MongoDbConnectionConfig): MongoClient {
    const url = this.createDsnFrom(config)

    return new MongoClient(url, config.clientOptions)
  }

  private createDsnFrom (config: MongoDbConnectionConfig): string {
    if (config.url) {
      return config.url
    }

    return `${config.protocol ?? ''}` // this.createConnectionUrl(config)
  }

  /**
   * Returns the registered models.
   */
  models (): Array<typeof Model> {
    return this.meta.models
  }

  /**
   * Returns the MongoDB client instance.
   */
  client (): MongoClient {
    return this.meta.mongoClient
  }

  /**
   * Returns the configured MongoDB database name.
   */
  databaseName (): string {
    return this.client().db().databaseName
  }

  /**
   * Returns the collection name.
   *
   * @returns {String}
   */
  async connect (): Promise<void> {
    this.markAsConnecting()
    await this.client().connect()
    this.markAsConnected()

    await this.boot()
  }

  /**
   * Returns the collection name.
   *
   * @returns {String}
   */
  protected async boot (): Promise<void> {
    await this.bootModels()
  }

  /**
   * Boot all registered models.
   */
  protected async bootModels (): Promise<void> {
    await Collect(this.models()).forEach(async model => {
      await model
        .withDatabase(this)
        .boot()
    })
  }

  /**
   * Returns the collection name.
   *
   * @returns {String}
   */
  async disconnect (): Promise<void> {
    await this.client().close()
    this.markAsDisconnected()
  }

  /**
   * Returns the collection name.
   *
   * @returns {String}
   */
  async databases (): Promise<ListDatabasesResult> {
    return this.client().db().admin().listDatabases()
  }

  /**
   * Returns the collections in the database. You may provide a `databaseName`
   * to select that specific database and list all its available collections.
   *
   * @param {String} databaseName
   *
   * @returns {Arr<CollectionInfo>}
   */
  async collections (databaseName?: string): Promise<Arr<CollectionInfo>> {
    return Arr.from(
      await this.client().db(databaseName).listCollections().toArray()
    )
  }

  /**
   * Creates a new collection with the given `name`.
   *
   * @param {String} name
   *
   * @returns {Collection}
   */
  async createCollection (name: string): Promise<Collection> {
    return await this.client().db().createCollection(name)
  }

  /**
   * Determine whether a collection with the given `name` exists in the database.
   *
   * @param {String} name
   *
   * @returns {Collection}
   */
  async hasCollection (name: string): Promise<boolean> {
    const collections = await this.collections()

    return collections.has(collection => {
      return collection.name === name
    })
  }

  /**
   * Determine whether a collection with the given `name` does not exist.
   *
   * @param {String} name
   *
   * @returns {Collection}
   */
  async isMissingCollection (name: string): Promise<boolean> {
    return !await this.hasCollection(name)
  }

  /**
   * Returns the connection state.
   *
   * @returns {ConnectionState}
   */
  state (): ConnectionState {
    return this.meta.state
  }

  /**
   * Determine whether the connection state is the given `state`.
   *
   * @param {ConnectionState} state
   *
   * @returns {Boolean}
   */
  isState (state: ConnectionState): boolean {
    return this.state() === state
  }

  /**
   * Determine whether a connection to MongoDB exists.
   *
   * @returns {Boolean}
   */
  isConnected (): boolean {
    return this.isState('connected')
  }

  /**
   * Determine whether a connection to MongoDB does not exists.
   *
   * @returns {Boolean}
   */
  isDisconnected (): boolean {
    return !this.isConnected()
  }

  /**
   * Mark this connection as connected.
   *
   * @returns {this}
   */
  protected markAsConnected (): this {
    this.meta.state = 'connected'

    return this
  }

  /**
   * Mark this connection as connecting.
   *
   * @returns {this}
   */
  protected markAsConnecting (): this {
    this.meta.state = 'connecting'

    return this
  }

  /**
   * Mark this connection as connecting.
   *
   * @returns {this}
   */
  protected markAsDisconnected (): this {
    this.meta.state = 'disconnected'

    return this
  }

  /**
   * Register the given `ModelClass` to this database.
   *
   * @param ModelClass
   *
   * @returns {this}
   */
  register (ModelClass: typeof Model): this {
    this.models().push(ModelClass)

    return this
  }
}
