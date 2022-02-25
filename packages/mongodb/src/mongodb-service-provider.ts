'use strict'

import { Model } from '.'
import { MongodbManager } from './mongodb-manager'
import { ServiceProvider } from '@supercharge/support'
import { ServiceProvider as ServiceProviderContract } from '@supercharge/contracts'

export class MongodbServiceProvider extends ServiceProvider implements ServiceProviderContract {
  /**
   * Register MongoDB services into the container.
   */
  override register (): void {
    this.registerDatabase()
  }

  registerDatabase (): void {
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
    Model.database = this.app().make('mongodb')
  }
}
