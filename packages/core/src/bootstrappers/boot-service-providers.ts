
import { Application, Bootstrapper } from '@supercharge/contracts'

export class BootServiceProviders implements Bootstrapper {
  /**
   * Bootstrap the given application.
   */
  async bootstrap (app: Application): Promise<void> {
    await app.boot()
  }
}
