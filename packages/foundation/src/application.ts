'use strict'

import Fs from 'fs'
import Path from 'path'
import Config from '@supercharge/config'
import Collect from '@supercharge/collections'
import { tap, upon } from '@supercharge/goodies'
import { Application as ApplicationContract, ConfigStore, Bootstrapper, BootstrapperContstructor } from '@supercharge/contracts'

export class Application implements ApplicationContract {
  /**
   * The absolute path to the application’s root directory.
   */
  private readonly appRoot: string

  /**
   * The environment file to load during application bootstrapping.
   */
  private _environmentFile: string = '.env'

  /**
   * Indicate whether the application runs in the console.
   */
  private isRunningInConsole: boolean = false

  /**
   * The list of application bootstrappers.
   */
  protected bootstrappers: BootstrapperContstructor[] = []

  /**
   * Create a new application instance.
   *
   * @param basePath - the application root path
   */
  constructor (basePath: string) {
    this.appRoot = basePath
  }

  /**
   * Create a new application instance.
   *
   * @param {String} basePath - absolute path to the application’s root directory
   *
   * @returns {Application}
   */
  static createWithAppRoot (basePath: string): Application {
    return new Application(basePath)
  }

  /**
   * Returns the application version defined in the `package.json` file.
   *
   * @returns {String}
   */
  version (): string {
    return upon(this.readPackageJson(), pkg => {
      return pkg.version
    })
  }

  /**
   * Read the contents of the application’s `package.json` file.
   *
   * @returns {String}
   */
  readPackageJson () {
    return JSON.parse(
      Fs.readFileSync(
        this.resolvePathTo('package.json')
      ).toString()
    )
  }

  /**
   * Resolves an absolute path to the given the given `destination` in
   * the application directory, starting at the application root.
   *
   * @param {String} destination
   *
   * @returns {String}
   */
  resolvePathTo (...destination: string[]) {
    return Path.resolve(this.basePath(), ...destination)
  }

  /**
   * Returns the root path of the application directory.
   *
   * @returns {String}
   */
  basePath (): string {
    return this.appRoot
  }

  /**
   * Returns the app config store instance.
   *
   * @returns {ConfigStore}
   */
  config (): ConfigStore {
    return Config
  }

  /**
   * Returns an absolute path into the application’s config directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  configPath (path: string): string {
    return this.resolvePathTo('config', path)
  }

  /**
   * Returns an absolute path into the application’s resources directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  resourcePath (path: string): string {
    return this.resolvePathTo('resources', path)
  }

  /**
   * Returns an absolute path into the application’s storage directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  storagePath (path: string): string {
    return this.resolvePathTo('sotrage', path)
  }

  /**
   * Set the environment file to be loaded while bootstrapping the application.
   *
   * @param {String} file
   *
   * @returns {Application}
   */
  loadEnvironmentFrom (file: string): this {
    return tap(this, () => {
      this._environmentFile = file
    })
  }

  /**
   * Returns the environment file of the application. By default, this is `.env`.
   *
   * @returns {String}
   */
  environmentFile (): string {
    return this._environmentFile || '.env'
  }

  /**
   * Returns the path to directory of the environment file.
   * By default, this is the application's base path.
   *
   * @param {String} path - an optional path appended to the config path
   *
   * @returns {String}
   */
  environmentPath (): string {
    return this.basePath()
  }

  /**
   * Bootstrap the application with the given array of `boostrappers`.
   *
   * @param {BootstrapperContstructor} bootstrappers
   */
  async boot (): Promise<void> {
    await this.bootstrapWith(this.bootstrappers)
  }

  /**
   * Prepare booting application by running the `bootstrappers`.
   *
   * @param {Array} bootstrappers
   */
  async bootstrapWith (bootstrappers: BootstrapperContstructor[]): Promise<void> {
    await Collect(
      bootstrappers
    ).forEach(async (bootstrapper: BootstrapperContstructor) => {
      return this.make(bootstrapper).bootstrap(this)
    })
  }

  /**
   * Load the configured applications bootstrappers.
   */
  async loadConfiguredBootstrappers () {
    this.bootstrappers = await Collect(
      this.bootstrappers
    ).concat(
      this.config().get('app.bootstrappers', [])
    )
  }

  /**
   * Returns a bootstrapper instance.
   *
   * @param Candidate
   *
   * @returns {Bootstrapper}
   */
  make (Candidate: BootstrapperContstructor): Bootstrapper {
    return new Candidate()
  }

  /**
   * Determine whether the application is running in the console.
   *
   * @returns {Boolean}
   */
  runningInConsole (): boolean {
    return this.isRunningInConsole
  }

  /**
   * Mark the application as running in the console.
   *
   * @returns {Application}
   */
  markAsRunningInConsole (): this {
    return tap(this, () => {
      this.isRunningInConsole = true
    })
  }
}
