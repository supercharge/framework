'use strict'

import { CAC } from 'cac'
import { Parser } from './parser'
import { ConsoleInput } from './input'
import { Command as CommandInstance } from './command'
import { Command, ConsoleApplication as ConsoleApplicationContract, Application as App } from '@supercharge/contracts'

export class Application implements ConsoleApplicationContract {
  /**
   * The CLI application instance. We use the CAC library as the
   * underlying CLI framework. All Supercharge and app commands
   * will be translated and registered to the CAC instance.
   */
  private readonly cli: CAC

  /**
   * The list of commands.
   */
  public static commands: Command[] = []

  /**
   * Create a new console application instance.
   *
   * @param app
   */
  constructor (app: App) {
    this.cli = new CAC('Supercharge Craft')
      .version(app.version())
      .help()

    app.markAsRunningInConsole()
  }

  /**
   * Runs the incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (process.argv)
   *
   * @returns {Promise}
   */
  async run (input: string[]): Promise<any> {
    await this.registerCommands()

    return this.cli.parse(input)
  }

  /**
   * Register
   */
  async registerCommands (): Promise<void> {
    this.registerDefaultCommand()

    Application.commands.forEach((command: Command) => {
      this.registerCommand(command)
    })
  }

  /**
   * Register a default command printing all available commands
   * to the terminal when the input is empty. This is done via
   * an empty CAC command printing the default help text.
   */
  private registerDefaultCommand (): void {
    this.cli
      .command('')
      .action(() => {
        this.cli.outputHelp()
      })
  }

  /**
   * Register the given console command.
   *
   * @param {Command} candidate
   */
  registerCommand (candidate: Command): void {
    const command = this.resolve(candidate)

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
   * Create a new instance of the given command.
   *
   * @param CommandConstructor
   *
   * @returns {CommandInstance}
   */
  resolve (CommandConstructor: Command): CommandInstance {
    return new CommandConstructor()
  }

  /**
   * Parse the given command `signature`.
   *
   * @param {String} signature
   *
   * @returns {Object}
   */
  parse (signature: string) {
    return Parser.parse(signature)
  }
}
