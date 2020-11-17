'use strict'

import { Application } from '../foundation'

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
  register? (app: Application): void

  /**
   * Boot application services.
   *
   * @param {Application} app - the application instance
   */
  boot? (app: Application): void | Promise<void>
}
