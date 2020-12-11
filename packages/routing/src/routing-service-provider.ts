'use strict'

import { Router } from './router'
import { ServiceProvider } from '@supercharge/support'

export class RoutingServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  register (): void {
    this.app().container().singleton('supercharge/route', () => {
      return new Router(this.app())
    })
  }
}
