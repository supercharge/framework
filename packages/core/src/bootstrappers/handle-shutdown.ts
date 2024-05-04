
import { Application, Bootstrapper } from '@supercharge/contracts'
import { ShutdownSignalListener } from '../shutdown-signal-listener.js'

export class HandleShutdown implements Bootstrapper {
  private readonly app: Application
  private readonly shutdownSignalListener: ShutdownSignalListener

  /**
   * Create a new instance.
   */
  constructor (app: Application) {
    this.app = app
    this.shutdownSignalListener = new ShutdownSignalListener(app)
  }

  /**
   * Register a listener for shutdown signals (`SIGINT` and `SIGTERM` by default).
   */
  async bootstrap (): Promise<void> {
    this.shutdownSignalListener
      .onShutdown(async () => await this.app.shutdown())
      .onShutdown(() => this.shutdownSignalListener.cleanup())
      .listen()
  }
}
