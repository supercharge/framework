'use strict'

import { Hash } from './index'
import { Application, Bootstrapper } from '@supercharge/contracts'

export class HashingBootstrapper implements Bootstrapper {
  /**
   * Run the app bootstrapping.
   *
   * @param {Application} app
   */
  async bootstrap (app: Application): Promise<void> {
    Hash.setApp(app)
  }
}
