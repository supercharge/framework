'use strict'

import { MongodbManager } from './mongodb-manager'
import { Model, MongodbConnectionResolver } from '.'
import { ServiceProvider } from '@supercharge/support'
import { ServiceProvider as ServiceProviderContract } from '@supercharge/contracts'

export class MongodbServiceProvider extends ServiceProvider implements ServiceProviderContract {
  /**
   * Register MongoDB services into the container.
   */
  override register (): void {
    this.registerDatabase()
  }

  /**
   * Register the MongoDB database.
   */
  private registerDatabase (): void {
    this.app().singleton('mongodb', () => {
      return new MongodbManager(
        this.app(), this.app().config().get('mongodb')
      )
    })
  }

  /**
   * Boot MongoDB services.
   */
  override async boot (): Promise<void> {
    const db = this.app().make<MongodbConnectionResolver>('mongodb')
    await db.boot()

    Model.setConnectionResolver(db)
  }
}
