'use strict'

import { Command } from './command'
import Fs from '@supercharge/filesystem'
import { upon } from '@supercharge/goodies'
import Collect from '@supercharge/collections'
import { Application as Craft } from './application'
import { BootApplication, HandleExceptions, LoadBootstrappers } from '@supercharge/foundation'
import { ConsoleKernel as ConsoleKernelContract, Application, BootstrapperContstructor } from '@supercharge/contracts'

export class Kernel implements ConsoleKernelContract {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * The console application instance.
   */
  private craft: Craft | undefined

  /**
   * The list of bootstrappers.
   */
  protected bootstrappers: BootstrapperContstructor[] = [
    HandleExceptions,
    LoadBootstrappers,
    BootApplication
  ]

  /**
   * Create a new console kernel instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.app = app
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
    await this.getCraft().run(input)
  }

  /**
   * Bootstrap the console application for Craft commands.
   */
  async bootstrap (): Promise<void> {
    await this.app.bootstrapWith(this.bootstrappers)
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
        return Fs.exists(path)
      })
      .flatMap(async (path: string) => {
        return Fs.allFiles(path)
      })
      .map((commandFile: string) => {
        return this.resolve(commandFile)
      })
      .filter((command: Command) => {
        return command instanceof Command
      })
      .forEach((command: Command) => {
        this.getCraft().registerCommand(command)
      })
  }

  /**
   * Requires the given file from disk.
   *
   * @param {String} commandFile
   *
   * @returns {Command}
   */
  resolve (commandFile: string): Command {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return upon(require(commandFile), (Candidate) => {
      return new Candidate()
    })
  }

  /**
   * Returns a Craft console application instance.
   *
   * @returns {Craft}
   */
  getCraft (): Craft {
    if (!this.craft) {
      this.craft = new Craft(this.app)
    }

    return this.craft
  }
}
