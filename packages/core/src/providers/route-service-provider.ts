
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
    this.booted(async () => {
      await this.runRouteLoadingCallbacks()
    })
  }

  /**
   * Run the registered route-loading callbacks.
   */
  protected async runRouteLoadingCallbacks (): Promise<void> {
    for (const callback of this.loadRoutesCallbacks) {
      await callback()
    }
  }

  /**
   * Load the routes file from the given `path`.
   */
  loadRoutesFrom (path: string): this {
    return this.loadRoutesUsing(async () => {
      // we may need to bypass the module cache, like by appending a query parameter `${path}?update=${Date.now()}`
      await import(path)
    })
  }

  /**
   * Register a callback that will be used to load the application’s routes.
   */
  loadRoutesUsing (callback: () => Promise<unknown> | unknown): this {
    return tap(this, () => {
      this.loadRoutesCallbacks.push(callback)
    })
  }
}
