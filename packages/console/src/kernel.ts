'use strict'

// import { Command } from './command'
import Fs from '@supercharge/filesystem'
import Collect from '@supercharge/collections'
import { Application as Craft } from './application'
import { ConsoleKernel as ConsoleKernelContract, Application, Bootstrapper } from '@supercharge/contracts'

export class Kernel implements ConsoleKernelContract {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * The list of console commands.
   */
  private readonly commandList: string[]

  /**
   * The list of bootstrappers to boot when starting the app.
   */
  protected readonly bootstrappers: Bootstrapper[] = []

  /**
   * Create a new console kernel instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.app = app
    this.commandList = []
  }

  /**
   * Handle an incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (process.argv)
   *
   * @returns {Promise}
   */
  async handle (input: string[]): Promise<any> {
    await this.bootstrap()
    await this.craft().run(input)
  }

  /**
   * Bootstrap the console application for Craft commands.
   */
  async bootstrap (): Promise<void> {
    // TODO
    // maybe "this.app.bootstrap()" or "this.app.bootstrapWith(this.bootstrappers)"?
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
    // load files from the `directory`, recursively

    await Collect(paths)
      .unique()
      .flatMap(async (path: string) => {
        return Fs.allFiles(path)
      })
      .filter((command: string) => {
        // TODO the @supercharge/classes package must implement the "isSubclassOf" method
        // return isSubclassOf(command, Command)

      })
      .forEach(async (command: string) => {
        this.commandList.push(command)
      })
  }

  /**
   * Returns a Craft console application instance.
   *
   * @returns {Craft}
   */
  craft (): Craft {
    return new Craft(this.app)
  }
}
