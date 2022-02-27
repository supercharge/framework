'use strict'

import { Arr } from '@supercharge/arrays'
import { tap } from '@supercharge/goodies'
import { ConnectionState, MongodbConnection } from './contracts'
import { Collection, CollectionInfo, ListDatabasesResult, MongoClient, MongoClientOptions } from 'mongodb'

export class Connection extends MongoClient implements MongodbConnection {
  /**
   * Stores the database details.
   */
  private readonly meta: {
    /**
     * The client connection state, determining whether it’s connected or not.
     */
    state: ConnectionState
  }

  /**
   * Create a new database instance.
   */
  constructor (url: string, options?: MongoClientOptions) {
    super(url, options)

    this.meta = { state: 'disconnected' }
  }

  /**
   * Returns the configured MongoDB database name.
   */
  databaseName (): string {
    return this.db().databaseName
  }

  /**
   * Returns the collection name.
   *
   * @returns {String}
   */
  override async connect (): Promise<this> {
    this.markAsConnecting()
    await super.connect()

    return tap(this, () => {
      this.markAsConnected()
    })
  }

  /**
   * Returns the collection name.
   *
   * @returns {String}
   */
  async disconnect (): Promise<void> {
    await super.close()
    this.markAsDisconnected()
  }

  /**
   * Returns the collection name.
   *
   * @returns {String}
   */
  async databases (): Promise<ListDatabasesResult> {
    return this.db().admin().listDatabases()
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
      await this.db(databaseName).listCollections().toArray()
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
    return await this.db().createCollection(name)
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
   * Determine whether a connection to MongoDB is currently established.
   *
   * @returns {Boolean}
   */
  isConnecting (): boolean {
    return this.isState('connecting')
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
}
