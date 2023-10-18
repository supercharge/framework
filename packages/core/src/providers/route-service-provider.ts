
import { tap } from '@supercharge/goodies'
import { ServiceProvider } from '@supercharge/support'

export class RouteServiceProvider extends ServiceProvider {
  /**
   * Stores the callback functions that load route files.
   */
  private readonly loadRoutesCallbacks: Array<(() => void)> = []

  /**
   * Register application services to the container.
   */
  override register (): void {
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
   */
  loadRoutesFrom (path: string): this {
    return this.loadRoutesUsing(() => {
      this.clearRequireCacheFor(path)
      require(path)
    })
  }

  /**
   * Delete the require cache entry for the given `path` if it exists.
   *
   * @see https://nodejs.org/api/modules.html#modules_caching
   */
  protected clearRequireCacheFor (path: string): this {
    if (require.cache[path]) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete require.cache[path]
    }

    return this
  }

  /**
   * Register a callback that will be used to load the application’s routes.
   */
  loadRoutesUsing (callback: () => void): this {
    return tap(this, () => {
      this.loadRoutesCallbacks.push(callback)
    })
  }
}
