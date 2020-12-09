'use strict'

import { tap } from '@supercharge/goodies'
import { ServiceProvider } from '@supercharge/support'

export class RouteServiceProvider extends ServiceProvider {
  private loadRoutesCallback: undefined | (() => void)

  /**
   * Register application services to the container.
   */
  register (): void {
    this.booted(() => {
      this.loadRoutes()
    })
  }

  /**
   * Register a callback that will be used to load the application’s routes.
   *
   * @param callback
   *
   * @returns {RouteServiceProvider}
   */
  loadRoutesUsing (callback: () => void): this {
    return tap(this, () => {
      this.loadRoutesCallback = callback
    })
  }

  /**
   * Load the routes file from the given `path`.
   *
   * @param callback
   *
   * @returns {RouteServiceProvider}
   */
  loadRoutesFrom (path: string): this {
    return tap(this, () => {
      require(path)
    })
  }

  /**
   * Load the application routes.
   *
   * @return void
   */
  protected loadRoutes (): void {
    if (typeof this.loadRoutesCallback === 'function') {
      return this.loadRoutesCallback()
    }
  }
}
