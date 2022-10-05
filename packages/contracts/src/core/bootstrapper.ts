'use strict'

import { Application } from '../application'

export type BootstrapperCtor =
  /**
   * Create a new bootstrapper instance.
   *
   * @param {Application} app - the application instance
   */
  new(app: Application) => Bootstrapper

export interface Bootstrapper {
  /**
   * Bootstrap the given application.
   *
   * @param {Application} app - the application instance
   */
  bootstrap(app: Application): Promise<void>
}
