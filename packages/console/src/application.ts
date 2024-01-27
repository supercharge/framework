
import { Command } from './command.js'
import { Application as CedarApplication } from '@supercharge/cedar'
import { ConsoleApplication as ConsoleApplicationContract, Application as SuperchargeApp } from '@supercharge/contracts'

export class Application extends CedarApplication implements ConsoleApplicationContract {
  /**
   * The Supercharge application instance.
   */
  protected readonly supercharge: SuperchargeApp

  /**
   * Create a new console application instance.
   */
  constructor (app: SuperchargeApp) {
    super(app.name())

    app.markAsRunningInConsole()

    this.supercharge = app
    this.setVersion(app.version() ?? '')
  }

  /**
   * Add the given `command` to this application.
   */
  override add (command: Command): this {
    if (typeof command.setSupercharge === 'function') {
      command.setSupercharge(this.supercharge)
    }

    return super.add(command)
  }
}
