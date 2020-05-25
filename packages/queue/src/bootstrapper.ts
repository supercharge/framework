'use strict'

import Queue from './index'
import { Application } from '@supercharge/contracts'

export class QueueBootstrapper {
  /**
   * Run the app bootstrapping.
   *
   * @param {Application} app
   */
  async boot (app: Application): Promise<void> {
    Queue.setApp(app)
  }
}
