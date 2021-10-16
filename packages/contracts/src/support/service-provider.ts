'use strict'

import { Application } from '../core'

export type ServiceProviderCtor =
  /**
   * Create a new service provider instance.
   *
   * @param {Application} app - the application instance
   */
  new(app: Application) => ServiceProvider

export interface ServiceProvider {
  /**
   * Returns the application instance.
   *
   * @returns {Application}
   */
  app (): Application

  /**
   * Register application services to the container.
   *
   * @param {Application} app - the application instance
   */
  register (app: Application): void

  /**
   * Boot application services.
   *
   * @param {Application} app - the application instance
   */
  boot? (app: Application): void | Promise<void>

  /**
   * Register a booting callback that runs before the `boot` method is called.
   *
   * @param callback Function
   */
  booting (callback: () => void): this

  /**
   * Register a booted callback that runs after the `boot` method was called.
   *
   * @param callback Function
   */
  booted (callback: () => void): this

  /**
   * Call the registered booting callbacks.
   */
  callBootingCallbacks (): void

  /**
   * Call the registered booted callbacks.
   */
  callBootedCallbacks (): void

  /**
   * Merge the content of the configuration file located at the
   * given `path` with the existing app configuration.
   */
  mergeConfigFrom (path: string, key: string): this
}
