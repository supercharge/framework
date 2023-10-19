
import { Str } from '@supercharge/strings'

export abstract class Manager<Application extends any> {
  /**
   * The application instance used to access the app configuration.
   */
  protected app: Application

  /**
   * Stores the map of cached drivers for this manager instance.
   */
  protected readonly drivers: Map<string, any>

  /**
   * Create a new manager instance.
   */
  constructor (app: Application) {
    this.app = app
    this.drivers = new Map()
  }

  /**
   * Returns the default driver name.
   */
  protected abstract defaultDriver (): string

  /**
   * Returns the driver instance.
   */
  protected driver (driver: string = this.defaultDriver()): any {
    if (this.isNotCached(driver)) {
      this.createDriver(driver)
    }

    return this.fromCache(driver)
  }

  /**
   * Create a new database client for the given `driver` name.
   */
  protected createDriver (driver: string): this {
    const method: string = `create${Str(driver).studly().get()}Driver`

    // @ts-expect-error `this[method]` should be save to access
    if (typeof this[method] === 'function') {
      // @ts-expect-error … same here as above
      return this.addToCache(driver, this[method]())
    }

    throw new Error(`Unsupported driver "${driver}". "${this.constructor.name}" does not implement the "${method}" method`)
  }

  /**
   * Returns the cached client instance for the given `driver`.
   */
  fromCache (driver: string): any {
    return this.drivers.get(driver)
  }

  /**
   * Cache the client instance for the given `driver`.
   */
  addToCache (driver: string, client: any): this {
    this.drivers.set(driver, client)

    return this
  }

  /**
   * Determine whether the given `driver` is already cached.
   */
  isCached (driver: string): boolean {
    return this.drivers.has(driver)
  }

  /**
   * Determine whether the given `driver` is missing in the cache.
   */
  isNotCached (driver: string): boolean {
    return !this.isCached(driver)
  }
}
