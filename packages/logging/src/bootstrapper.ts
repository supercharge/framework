'use strict'

import { Logger } from './index'
import { Application, Bootstrapper } from '@supercharge/contracts'

export class LoggingBootstrapper implements Bootstrapper {
  /**
   * Run the app bootstrapping.
   *
   * @param {Application} app
   */
  async bootstrap (app: Application): Promise<void> {
    Logger.setApp(app)
  }
}
