'use strict'

import { MongoClient } from 'mongodb'

export type ConnectionState = 'disconnected' | 'connecting' | 'connected'

/**
 * Defines the MongoDB database contract.
 */
export interface MongodbConnection {
  client(): MongoClient

  connect(): Promise<void>
  disconnect(): Promise<void>

  isConnected(): boolean
  isDisconnected(): boolean

  // register (ModelClass: MoonModel): this
}
