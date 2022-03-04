'use strict'

import { MongoClient } from 'mongodb'

export type ConnectionState = 'disconnected' | 'connecting' | 'connected'

export interface MongodbConnectionResolver {
  /**
   * Boot the connection resolver.
   */
  boot(): Promise<void>

  /**
   * Returns the connection for the given `name`. Returns
   * the default connection when not providing a `name`.
   */
  connection(name?: string): Promise<MongodbConnection>

  /**
   * Closes the connection for the given `name`. Closes
   * the default connection not providing a `name`.
   */
  disconnect(name?: string): Promise<void>

  /**
   * Closes all opened connections.
   */
  disconnectAll(): Promise<void>
}

/**
 * Defines the MongoDB database contract.
 */
export interface MongodbConnection extends MongoClient {
  disconnect(): Promise<void>

  isConnected(): boolean
  isConnecting(): boolean
  isDisconnected(): boolean
}
