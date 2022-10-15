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
   * Creates a new console kernel instance for the given `app`.
   *
   * @param {Application} app
   */
  static for (app: Application): ConsoleKernel {
    return new this(app)
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
   * Prepare the console application by running the configured bootstrappers.
   * This method doesn’t register configured commands in the application.
   * It prepares the console application which is useful for testing.
   */
  async prepare (): Promise<this> {
    await this.app().bootstrapWith(
      this.bootstrappers()
    )

    return this
  }

  /**
   * Bootstrap the console application for Craft commands.
   */
  async bootstrap (): Promise<void> {
    await this.prepare()
    await this.commands()
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
        return await Fs.exists(path)
      })
      .flatMap(async (path: string) => {
        return await Fs.allFiles(path)
      })
      .map(async (commandFile: string) => {
        return await this.resolve(commandFile)
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
