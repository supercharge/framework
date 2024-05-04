
import { Knex } from 'knex'

export interface DatabaseConfig {
  /**
   * The default database connection name.
   *
   * @deprecated This `default` property is deprecated in favor of the `connection` property.
   */
  default?: string

  /**
   * The default database connection name.
   */
  connection: keyof this['connections']

  /**
   * The settings of configured database connections.
   */
  connections: Record<string, Knex.Config | string>
}
