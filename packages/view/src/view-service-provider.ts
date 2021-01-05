'use strict'

import { ViewManager } from './manager'
import { ServiceProvider } from '@supercharge/support'

export class ViewServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  register (): void {
    this.app().singleton('supercharge/view', () => {
      return new ViewManager(this.app())
    })
  }

  /**
   * Boot application services.
   */
  async boot (): Promise<void> {
    await this.app().make<ViewManager>('supercharge/view').boot()
  }
}
