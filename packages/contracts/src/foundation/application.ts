'use strict'

import { ConfigStore } from '../config'

export interface Application {
  /**
   * Returns the app version.
   *
   * @returns {String}
   */
  version(): string

  /**
   * Returns the root path of the application directory.
   *
   * @returns {String}
   */
  basePath(): string

  /**
   * Returns the app config store instance.
   *
   * @returns {ConfigStore}
   */
  config (): ConfigStore

  /**
   * Returns an absolute path into the application’s config directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  configPath (path: string): string

  /**
   * Returns an absolute path into the application’s resources directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  resourcePath (path: string): string

  /**
   * Returns an absolute path into the application’s storage directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  storagePath (path: string): string

  /**
   * Set the environment file to be loaded while bootstrapping the application.
   *
   * @param {String} file
   *
   * @returns {Application}
   */
  loadEnvironmentFrom(file: string): this

  /**
   * Returns the environment file of the application. By default, this is `.env`.
   *
   * @returns {String}
   */
  environmentFile(): string

  /**
   * Returns the path to directory of the environment file.
   * By default, this is the application's base path.
   *
   * @param {String} path - an optional path appended to the config path
   *
   * @returns {String}
   */
  environmentPath(): string

  /**
   * Bootstrap the application.
   */
  bootstrap(): Promise<void>

  /**
   * Determine whether the application is running in the console.
   *
   * @returns {Boolean}
   */
  runningInConsole (): boolean

  /**
   * Mark the application as running in the console.
   *
   * @returns {Application}
   */
  markAsRunningInConsole (): this
}
