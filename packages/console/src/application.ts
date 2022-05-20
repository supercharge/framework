'use strict'

import { Command } from './command'
import { Application as CedarApplication } from '@supercharge/cedar'
import { ConsoleApplication as ConsoleApplicationContract, Application as App } from '@supercharge/contracts'

export class Application extends CedarApplication implements ConsoleApplicationContract {
  /**
   * The Supercharge application instance.
   */
  protected readonly supercharge: App

  /**
   * Create a new console application instance.
   *
   * @param app
   */
  constructor (app: App) {
    super('Supercharge Framework')

    app.markAsRunningInConsole()

    this.supercharge = app
    this.setVersion(app.version() ?? '')
  }

  /**
   * Add the given `command` to this application.
   *
   * @param {Command} command
   *
   * @returns {Application}
   */
  override add (command: Command): this {
    if (typeof command.setSupercharge === 'function') {
      command.setSupercharge(this.supercharge)
    }

    return super.add(command)
  }
}
