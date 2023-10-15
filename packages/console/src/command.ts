
import { Application } from '@supercharge/contracts'
import { Command as CedarCommand } from '@supercharge/cedar'

export class Command extends CedarCommand {
  /**
   * The Supercharge application instance.
   */
  private _supercharge: Application | undefined

  /**
   * Returns the Supercharge application instance.
   *
   * @returns {Application}
   */
  supercharge (): Application {
    if (!this._supercharge) {
      throw new Error()
    }

    return this._supercharge
  }

  /**
   * Set the supercharge application instance for this command.
   *
   * @param app
   *
   * @returns {Command}
   */
  setSupercharge (app: Application): Command {
    this._supercharge = app

    return this
  }
}
