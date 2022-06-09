'use strict'

import Str from '@supercharge/strings'
import { Application, ConfigStore } from '@supercharge/contracts'

export abstract class Manager {
  /**
   * Theh application instance used to access the app configuration.
   */
  protected app: Application

  /**
   * Returns the cached database clients.
   */
  protected readonly drivers: Map<string, any>

  /**
   * Create a new manager instance.
   *
   * @param app
   */
  constructor (app: Application) {
    this.app = app
    this.drivers = new Map()
  }

  /**
   * Returns the default driver name.
   *
   * @returns {String}
   */
  protected abstract defaultDriver (): string

  /**
   * Returns an instance of the app configuration.
   *
   * @returns {ConfigStore}
   */
  protected config (): ConfigStore {
    return this.app.config()
  }

  /**
   * Returns the driver instance.
   *
   * @param {String} driver
   *
   * @returns {*}
   *
   * @throws
   */
  protected driver (driver: string = this.defaultDriver()): any {
    if (this.missing(driver)) {
      this.createDriver(driver)
    }

    return this.get(driver)
  }

  /**
   * Create a new database client for the given `driver` name.
   *
   * @param {String} driver
   */
  protected createDriver (driver: string): any {
    const method: string = `create${Str(driver).studly().get()}Driver`

    const self = (this as any)

    if (self[method]) {
      return this.set(driver, self[method]())
    }

    throw new Error(`Unsupported driver "${driver}".`)
  }

  /**
   * Returns the client instance for the given `driver`.
   *
   * @param {String} driver
   *
   * @returns {Object}
   */
  protected get (driver: string): any {
    return this.drivers.get(driver)
  }

  /**
   * Cache the client instance for the given `driver`.
   *
   * @param {String} driver
   * @param {Object} client
   */
  protected set (driver: string, client: any): void {
    this.drivers.set(driver, client)
  }

  /**
   * Determine whether the given `driver` is already cached.
   *
   * @param {String} driver
   *
   * @returns {Boolean}
   */
  protected has (driver: string): boolean {
    return this.drivers.has(driver)
  }

  /**
   * Determine whether the given `driver` is missing in the cache.
   *
   * @param {String} driver
   *
   * @returns {Boolean}
   */
  protected missing (driver: string): boolean {
    return !this.has(driver)
  }

  /**
   * Ensure the given config `key` is set in the application’s configuration.
   *
   * @param {String} key
   *
   * @example
   * ```
   * configValidator.ensureConfigExists('view')
   * configValidator.ensureConfigExists('app.port')
   * ```
   */
  ensureConfig (key: string, callback?: () => void): void {
    this.config().ensure(key, callback)
  }
}
