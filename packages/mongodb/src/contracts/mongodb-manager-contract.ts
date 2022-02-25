'use strict'

import { MongodbConnection } from '.'

export interface MongodbManagerContract {
  /**
   * Returns the default connection.
   */
  connection(): MongodbConnection

  /**
   * Returns a connection for the given `name`.
   */
  connection(name: string): MongodbConnection
}
