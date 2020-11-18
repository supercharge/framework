'use strict'

import { Application, Bootstrapper } from '@supercharge/contracts'

export class RegisterServiceProviders implements Bootstrapper {
  /**
   * Bootstrap the given application.
   *
   * @param {Application} app
   */
  async bootstrap (app: Application): Promise<void> {
    await app.registerConfiguredProviders()
  }
}
