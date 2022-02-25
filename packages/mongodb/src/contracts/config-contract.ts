'use strict'

import { MongoClientOptions } from 'mongodb'

/**
 * Defines the MongoDB configuration.
 */
export interface MongoDbConfig {
  default: string // keyof MongoDbConfig['connections']
  connections: { [key: string]: MongoDbConnectionConfig }
}

/**
 * The MongoDB connection options.
 */
export interface MongoDbConnectionConfig {
  url?: string
  host?: string
  port?: string | number
  protocol?: string
  database?: string
  clientOptions?: MongoClientOptions
}
