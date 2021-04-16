'use strict'

import { Model } from './model'
import { ServiceProvider } from '@supercharge/support'
import { DatabaseManager } from './database-manager'

export class DatabaseServiceProvider extends ServiceProvider {
  /**
   * Register application services into the container.
   */
  register (): void {
    this.app().singleton('db', () => {
      return new DatabaseManager(this.app())
    })

    Model.knex()
  }
}
