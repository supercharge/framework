'use strict'

import { Knex } from 'knex'

export interface DatabaseConfig {
  /**
   * The default database connection name.
   */
  default: string

  /**
   * The settings of configured database connections.
   */
  connections: Record<string, Knex.Config | string>
}
