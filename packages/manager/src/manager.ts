'use strict'

import Str from '@supercharge/strings'
import { Application, ConfigStore } from '@supercharge/contracts'

export abstract class Manager {
  /**
   * Theh application instance used to access the app configuration.
   */
  private app: Application | undefined

  /**
   * Create a new manager instance.
   *
   * @param app
   */
  constructor (app?: Application) {
    this.app = app
  }

  /**
   * Returns the cached database clients.
   */
  private readonly drivers: Map<string, any> = new Map()

  /**
   * Returns the default driver name.
   *
   * @returns {String}
   */
  abstract defaultDriver(): string

  /**
   * Set the app instance.
   *
   * @param app - the application instance
   */
  setApp (app: Application): this {
    this.app = app

    return this
  }

  /**
   * Returns an instance of the app configuration.
   *
   * @returns {ConfigStore}
   */
  config (): ConfigStore {
    if (this.app) {
      return this.app.config()
    }

    throw new Error(`Missing "app" instance on ${this.constructor.name}. Use ".setApp(app)" to set it on your manager.`)
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
  driver (driver: string = this.defaultDriver()): any {
    if (this.missing(driver)) {
      this.createDriver(driver)
    }

    return this.get(driver)
  }

  /**
   * Create a new database client for the given `driver` name.
   *
   * @param {String} driver
   * @param {Object} config
   */
  createDriver (driver: string): any {
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
  get (driver: string): any {
    return this.drivers.get(driver)
  }

  /**
   * Cache the client instance for the given `driver`.
   *
   * @param {String} driver
   * @param {Object} client
   */
  set (driver: string, client: any): void {
    this.drivers.set(driver, client)
  }

  /**
   * Determine whether the given `driver` is already cached.
   *
   * @param {String} driver
   *
   * @returns {Boolean}
   */
  has (driver: string): boolean {
    return this.drivers.has(driver)
  }

  /**
   * Determine whether the given `driver` is missing in the cache.
   *
   * @param {String} driver
   *
   * @returns {Boolean}
   */
  missing (driver: string): boolean {
    return !this.has(driver)
  }
}
