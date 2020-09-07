'use strict'

import { cac, CAC } from 'cac'
import { Command } from './command'
import { ConsoleInput } from './input'
import { Parser, ParsedSignature } from './parser'
import { ConsoleApplication as ConsoleApplicationContract, Application as App } from '@supercharge/contracts'

export class Application implements ConsoleApplicationContract {
  /**
   * The CLI application instance. We use the CAC library as the
   * underlying CLI framework. All Supercharge and app commands
   * will be translated and registered to the CAC instance.
   */
  private cli: CAC = cac()

  /**
   * Create a new console application instance.
   *
   * @param app
   */
  constructor (app: App) {
    this.createCli(app)
    app.markAsRunningInConsole()
  }

  /**
   * Create a CAC CLI instance.
   *
   * @param {App} app
   *
   * @returns {CAC}
   */
  createCli (app: App): void {
    this.cli = cac('node craft')
      .version(app.version())
      .help()

    this.registerDefaultCommand()
  }

  /**
   * Register a default command printing all available commands
   * to the terminal when the input is empty. This is done via
   * an empty CAC command printing the default help text.
   */
  private registerDefaultCommand (): void {
    this.cli
      .command('')
      .usage('[command] [...options]')
      .action(() => {
        this.cli.outputHelp()
      })
  }

  /**
   * Runs the incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (process.argv)
   *
   * @returns {Promise}
   */
  async run (input: string[]): Promise<any> {
    await this.cli.parse(input)
  }

  /**
   * Register the given console command.
   *
   * @param {Command} command
   */
  registerCommand (command: Command): void {
    const { name, parameters, options } = this.parse(command.signature())

    const cliCommand = this.cli
      .command(`${name} ${parameters.translateToCacInput()}`, command.description())
      .action(async (...inputs) => {
        await command.handle(...inputs)
      })

    options.forEach((option: ConsoleInput) => {
      cliCommand.option(option.translateToCacInput(), option.getDescription(), {
        default: option.getDefaultValue()
      })
    })
  }

  /**
   * Parse the given command `signature`.
   *
   * @param {String} signature
   *
   * @returns {Object}
   */
  parse (signature: string): ParsedSignature {
    return Parser.parse(signature)
  }
}
