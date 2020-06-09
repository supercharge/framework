'use strict'

import { CAC } from 'cac'
import { Command } from './command'
import { InputSet } from './input-set'
import Collect from '@supercharge/collections'
import { ConsoleApplication as ConsoleApplicationContract, Application } from '@supercharge/contracts'
import { Parser } from './parser'
import { InputArgument } from './input-argument'

export class ConsoleApplication implements ConsoleApplicationContract {
  /**
   * The application instance
   */
  private readonly app: Application

  /**
   * The CLI application instance. We use the CAC library as the
   * underlying CLI framework. All Supercharge and app commands
   * will be translated and registered to the CAC instance.
   */
  private readonly cli: CAC

  /**
   * The list of commands.
   */
  protected static commands: []

  /**
   * Create a new console application instance.
   *
   * @param app
   */
  constructor (app: Application) {
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
   *
   */
  async registerCommands (): Promise<void> {
    await Collect(
      this.resolveCommands(ConsoleApplication.commands)
    ).forEach((command: Command) => {
      this.registerCommand(command)
    })
  }

  /**
   * Register the given console command.
   *
   * @param {Command} command
   */
  registerCommand (command: Command): void {
    const { name, parameters, options } = Parser.parse(command.signature())

    const cliCommand = this.cli
      .command(name)
      .action(async () => {
        // TODO
        await command.handle(parameters, options)
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
   * Resolve an array of console commands.
   *
   * @param commands
   */
  resolveCommands (commands: string[]): Command[] {
    return commands.map(command => {
      return this.resolve(command)
    })
  }

  /**
   * Resolve a console command.
   *
   * @param command
   */
  resolve (command: any): Command {
    return new Command()
  }
}
