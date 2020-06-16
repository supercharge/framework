'use strict'

import { Application } from './application'

export interface Bootstrapper {
  /**
   * Bootstrap the given application.
   *
   * @param {Application} app - the application instance
   */
  bootstrap(app: Application): Promise<void>
}
