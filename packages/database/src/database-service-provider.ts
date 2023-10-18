
import { Model } from './model.js'
import { DatabaseManager } from './database-manager.js'
import { ServiceProvider } from '@supercharge/support'
import { DatabaseConfig } from '@supercharge/contracts'

/**
 * Add container bindings for services from this provider.
 */
declare module '@supercharge/contracts' {
  export interface ContainerBindings {
    'db': DatabaseManager
  }
}

export class DatabaseServiceProvider extends ServiceProvider {
  /**
   * Register application services into the container.
   */
  override register (): void {
    this.app().singleton('db', () => {
      const databaseConfig = this.app().config().get<DatabaseConfig>('database')

      return new DatabaseManager(databaseConfig)
    })

    Model.knex(
      this.app().make<DatabaseManager>('db').connection()
    )
  }

  /**
   * Stop application services.
   */
  override async shutdown (): Promise<void> {
    for (const connection of this.app().make<DatabaseManager>('db').connections()) {
      await connection.destroy()
    }
  }
}
