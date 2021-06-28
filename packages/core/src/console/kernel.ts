'use strict'

import Fs from '@supercharge/fs'
import Collect from '@supercharge/collections'
import { esmRequire } from '@supercharge/goodies'
import { Command, Application as Craft } from '@supercharge/console'
import { Application, BootstrapperCtor, ConsoleKernel as ConsoleKernelContract } from '@supercharge/contracts'
import { HandleExceptions, LoadConfiguration, LoadEnvironmentVariables, RegisterServiceProviders, BootServiceProviders } from '../bootstrappers'

export class ConsoleKernel implements ConsoleKernelContract {
  private readonly meta: {
    /**
     * The application instance.
     */
    app: Application

    /**
   * The console application instance.
   */
    craft?: Craft
  }

  /**
   * Create a new console kernel instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.meta = { app }
  }

  /**
   * Returns the application instance.
   *
   * @returns {Application}
   */
  app (): Application {
    return this.meta.app
  }

  /**
   * Returns the list of application bootstrappers.
   */
  protected bootstrappers (): BootstrapperCtor[] {
    return [
      HandleExceptions,
      LoadEnvironmentVariables,
      LoadConfiguration,
      RegisterServiceProviders,
      BootServiceProviders
    ]
  }

  /**
   * Handle an incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (process.argv)
   *
   * @returns {Promise}
   */
  async run (input?: string[]): Promise<any> {
    await this.bootstrap()
    await this.craft().run(input)
  }

  /**
   * Bootstrap the console application for Craft commands.
   */
  async bootstrap (): Promise<void> {
    await this.app().bootstrapWith(
      this.bootstrappers()
    )

    await this.commands()
  }

  /**
   * Returns the list of command class names to exclude when loading all
   * commands into the console application. This is useful for base
   * commands that provide shared functionality to other commands.
   *
   * @returns {Array}
   */
  excludedCommands (): string[] {
    return []
  }

  /**
   * Register the console commands to the application.
   */
  async commands (): Promise<void> {
    //
  }

  /**
   * Register all of the commands in the given `directories`.
   *
   * @param {Array} paths
   */
  async loadFrom (...paths: string[]): Promise<void> {
    await Collect(paths)
      .unique()
      .filter(async (path: string) => {
        return Fs.exists(path)
      })
      .flatMap(async (path: string) => {
        return Fs.allFiles(path)
      })
      .map((commandFile: string) => {
        return this.resolve(commandFile) as any // TODO fix this typing issue in @supercharge/collections
      })
      .filter((command: Command) => {
        return command instanceof Command && this.isNotExcluded(command)
      })
      .forEach((command: Command) => {
        this.craft().add(command)
      })
  }

  /**
   * Requires the given file from disk.
   *
   * @param {String} commandFile
   *
   * @returns {Command}
   */
  async resolve (commandFile: string): Promise<Command> {
    const CommandCtor = esmRequire(commandFile)

    return new CommandCtor()
  }

  /**
   * Determine whether the given `command` should not be excluded
   * from loading it to the list of available commands.
   *
   * @param {Command} command
   *
   * @returns {Boolean}
   */
  isNotExcluded (command: Command): boolean {
    return !this.shouldExclude(command)
  }

  /**
   * Determine whether the given `command` should be excluded
   * from loading it to the list of available commands.
   *
   * @param {Command} command
   *
   * @returns {Boolean}
   */
  shouldExclude (command: Command): boolean {
    return this.excludedCommands().includes(
      command.constructor.name
    )
  }

  /**
   * Returns a Craft console application instance.
   *
   * @returns {Craft}
   */
  craft (): Craft {
    if (!this.meta.craft) {
      this.meta.craft = new Craft(this.app())
    }

    return this.meta.craft
  }
}
