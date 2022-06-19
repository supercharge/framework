'use strict'

import { Application, Bootstrapper } from '@supercharge/contracts'
import { ShutdownSignalListener } from '../shutdown-signal-listener'

export class HandleShutdown implements Bootstrapper {
  private readonly app: Application
  private readonly shutdownSignalListener: ShutdownSignalListener

  constructor (app: Application) {
    this.app = app
    this.shutdownSignalListener = new ShutdownSignalListener(app)
  }

  /**
   * Tbd.
   */
  async bootstrap (): Promise<void> {
    this.shutdownSignalListener
      .onShutdown(async () => {
        await this.app.shutdown()
      })
      .listen()
  }
}
