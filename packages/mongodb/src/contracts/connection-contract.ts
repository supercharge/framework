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
