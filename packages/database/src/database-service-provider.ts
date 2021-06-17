'use strict'

import { Model } from './model'
import { DatabaseManager } from './database-manager'
import { ServiceProvider } from '@supercharge/support'

export class DatabaseServiceProvider extends ServiceProvider {
  /**
   * Register application services into the container.
   */
  register (): void {
    this.app().singleton('db', () => {
      return new DatabaseManager(this.app())
    })

    Model.knex(
      this.app().make<DatabaseManager>('db').connection()
    )
  }
}
