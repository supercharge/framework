'use strict'

import { ConfigStore } from '../config'
import { BootstrapperContstructor } from './bootstrapper'

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
   * @param {String} path - an optional path appended to the config path
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
   * Returns the path to the application's configuration files.
   *
   * @param {String} path - an optional path appended to the config path
   *
   * @returns {String}
   */
  configPath (path?: string): string

  /**
   * Returns the path to the application's resource files.
   *
   * @param {String} path - an optional path appended to the resource path
   *
   * @returns {String}
   */
  resourcePath (path?: string): string

  /**
   * Returns the path to the application's storage directory.
   *
   * @param {String} path - an optional path appended to the storage path
   *
   * @returns {String}
   */
  storagePath (path?: string): string

  /**
   * Returns the environment file of the application. By default, this is `.env`.
   *
   * @param {String} path - an optional path appended to the config path
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
   * Bootstrap the application with the given array of `boostrappers`.
   *
   * @param {BootstrapperContstructor} bootstrappers
   */
  bootstrapWith(bootstrappers: BootstrapperContstructor[]): Promise<void>
}
