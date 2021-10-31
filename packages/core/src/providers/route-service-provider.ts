'use strict'

import { tap } from '@supercharge/goodies'
import { ServiceProvider } from '@supercharge/support'

export class RouteServiceProvider extends ServiceProvider {
  private readonly loadRoutesCallbacks: Array<(() => void)> = []

  /**
   * Register application services to the container.
   */
  register (): void {
    this.booted(() => {
      this.runRouteLoadingCallbacks()
    })
  }

  /**
   * Run the registered route-loading callbacks.
   */
  protected runRouteLoadingCallbacks (): void {
    this.loadRoutesCallbacks.forEach(callback => {
      callback()
    })
  }

  /**
   * Load the routes file from the given `path`.
   *
   * @param callback
   *
   * @returns {this}
   */
  loadRoutesFrom (path: string): this {
    return this.loadRoutesUsing(() => {
      require(path)
    })
  }

  /**
   * Register a callback that will be used to load the application’s routes.
   *
   * @param callback
   *
   * @returns {this}
   */
  loadRoutesUsing (callback: () => void): this {
    return tap(this, () => {
      this.loadRoutesCallbacks.push(callback)
    })
  }
}
