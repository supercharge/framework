'use strict'

import { Router } from './router'
import { ServiceProvider } from '@supercharge/support'

export interface ContainerBindings {
  'route': Router
}

export class RoutingServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  register (): void {
    this.app().singleton('route', () => {
      return new Router(this.app())
    })
  }
}
