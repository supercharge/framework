'use strict'

import { ViewManager } from './manager'
import { ServiceProvider } from '@supercharge/support'

export interface ContainerBindings {
  'view': ViewManager
}

export class ViewServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  register (): void {
    this.app().singleton('view', () => {
      return new ViewManager(this.app())
    })
  }

  /**
   * Boot application services.
   */
  async boot (): Promise<void> {
    await this.app().make<ViewManager>('view').boot()
  }
}
