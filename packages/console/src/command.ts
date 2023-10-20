
import { Application } from '@supercharge/contracts'
import { Command as CedarCommand } from '@supercharge/cedar'

export class Command extends CedarCommand {
  /**
   * The Supercharge application instance.
   */
  private _supercharge: Application | undefined

  /**
   * Returns the Supercharge application instance.
   */
  supercharge (): Application {
    if (!this._supercharge) {
      throw new Error()
    }

    return this._supercharge
  }

  /**
   * Set the supercharge application instance for this command.
   */
  setSupercharge (app: Application): Command {
    this._supercharge = app

    return this
  }
}
