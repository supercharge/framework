'use strict'

import { Bootstrapper as BootstrapperContract, Application } from '@supercharge/contracts'

export class Bootstrapper implements BootstrapperContract {
  /**
   * Bootstrap the given application.
   *
   * @param {Application} app - the application instance
   */
  async bootstrap (_app: Application): Promise<void> {
    //
  }
}
