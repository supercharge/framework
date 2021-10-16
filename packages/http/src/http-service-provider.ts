'use strict'

import { Router } from './routing'
import { ServiceProvider } from '@supercharge/support'

export interface ContainerBindings {
  'route': Router
  'router': Router
}

export class HttpServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  register (): void {
    this.bindRouter()
  }

  /**
   * Bind the Router instance into the container.
   */
  private bindRouter (): void {
    this.app().singleton('route', () => {
      return new Router(this.app())
    })

    this.app().singleton('router', () => {
      return this.app().make('route')
    })
  }
}
