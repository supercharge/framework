
import { Application } from '@supercharge/contracts'
import { Command as CedarCommand } from '@supercharge/cedar'

export class Command extends CedarCommand {
  /**
   * The Supercharge application instance.
   */
  private superchargeApp: Application | undefined

  /**
   * Returns the Supercharge application instance. This method is an alias for
   * the `supercharge()` method. This method aligns the console app with the
   * rest of the framework, because there’s the `.app()` method elsewhere.
   */
  app (): Application {
    return this.supercharge()
  }

  /**
   * Returns the Supercharge application instance.
   */
  supercharge (): Application {
    if (!this.superchargeApp) {
      throw new Error('Missing Supercharge application instance. You must set it via the `setSupercharge` method when registering this command')
    }

    return this.superchargeApp
  }

  /**
   * Set the supercharge application instance for this command.
   */
  setSupercharge (app: Application): this {
    this.superchargeApp = app

    return this
  }
}
