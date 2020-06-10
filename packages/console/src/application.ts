'use strict'

import { CAC } from 'cac'
import { Parser } from './parser'
import { InputArgument } from './input'
import { Command as CommandInstance } from './command'
import { Command, ConsoleApplication as ConsoleApplicationContract, Application as App } from '@supercharge/contracts'

export class Application implements ConsoleApplicationContract {
  /**
   * The application instance
   */
  private readonly app: App

  /**
   * The CLI application instance. We use the CAC library as the
   * underlying CLI framework. All Supercharge and app commands
   * will be translated and registered to the CAC instance.
   */
  private readonly cli: CAC

  /**
   * The list of commands.
   */
  public static commands: Command[]

  /**
   * Create a new console application instance.
   *
   * @param app
   */
  constructor (app: App) {
    this.app = app
    this.cli = this.createCli()
  }

  /**
   * Create a CLI instance.
   *
   * @returns {CAC}
   */
  createCli (): CAC {
    return new CAC('Supercharge Craft')
      .version(this.app.version())
      .help()
  }

  /**
   * Runs the incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (process.argv)
   *
   * @returns {Promise}
   */
  async run (input: string[]): Promise<any> {
    // TODO add all commands to the cli
    await this.registerCommands()

    // and finally: run the CLI (by calling .parse() on the CAC instance)
    return this.cli.parse(input)
  }

  /**
   * Register
   */
  async registerCommands (): Promise<void> {
    Application.commands.forEach((command: Command) => {
      this.registerCommand(command)
    })
  }

  /**
   * Register the given console command.
   *
   * @param {Command} candidate
   */
  registerCommand (candidate: Command): void {
    const command = this.resolve(candidate)

    const { name, parameters, options } = this.parse(command)

    const cliCommand = this.cli
      .command(`${name} ${parameters.keys}`)
      .action(async (...inputs) => {
        await command.handle(...inputs)
      })

    options.forEach((option: InputArgument) => {
      // TODO translate option arguments to CAC style:
      //   “angled brackets indicate that a string / number value is required, while square bracket indicate that the value can also be true”

      cliCommand.option(option.getName(), option.getDescription(), {
        default: option.getDefault()
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
   * Parse the given `command`’s signature.
   *
   * @param {CommandInstance} command
   *
   * @returns {Object}
   */
  parse (command: CommandInstance) {
    return Parser.parse(command.signature())
  }
}
