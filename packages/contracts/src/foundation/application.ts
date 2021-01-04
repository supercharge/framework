'use strict'

import { EnvStore } from '../env'
import { Logger } from '../logging'
import { ConfigStore } from '../config'
import { Container } from '../container'
import { BootstrapperCtor } from './bootstrapper'

export interface Application extends Container {
  /**
   * Returns the logger instance.
   */
  logger(): Logger

  /**
   * Returns the app key.
   */
  key(): string

  /**
   * Returns the app version.
   */
  version(): string | undefined

  /**
   * Returns the root path of the application directory.
   */
  basePath(): string

  /**
   * Returns the resolved path to `path` starting at the application’s base path.
   */
  resolveFromBasePath(path: string): string

  /**
   * Returns the resolved path to `path` starting at the application’s base path.
   */
  resolveGlobFromBasePath(path: string): string

  /**
   * Returns the config store instance.
   */
  config (): ConfigStore

  /**
   * Returns an absolute path into the application’s config directory.
   *
   * @param {String} path
   */
  configPath (path: string): string

  /**
   * Returns an absolute path into the application’s public directory.
   *
   * @param {String} path
   */
  publicPath (path?: string): string

  /**
   * Returns an absolute path into the application’s resources directory.
   *
   * @param {String} path
   */
  resourcePath (path: string): string

  /**
   * Returns an absolute path into the application’s storage directory.
   *
   * @param {String} path
   */
  storagePath (path: string): string

  /**
   * The env store instance.
   */
  env(): EnvStore

  /**
   * Returns the environment file of the application. By default, this is `.env`.
   */
  environmentFile(): string

  /**
   * Set the environment file to be loaded while bootstrapping the application.
   *
   * @param {String} file
   */
  loadEnvironmentFrom(file: string): this

  /**
   * Returns the path to directory of the environment file.
   * By default, this is the application's base path.
   *
   * @param {String} path - an optional path appended to the config path
   */
  environmentPath(): string

  /**
   * Prepare booting application by running the array of `bootstrappers`.
   *
   * @param {Array} bootstrappers
   */
  bootstrapWith(bootstrappers: BootstrapperCtor[]): Promise<void>

  /**
   * Register the configured user-land providers.
   */
  registerConfiguredProviders(): Promise<void>

  /**
   * Boot the application.
   */
  boot(): Promise<void>

  /**
   * Determine whether the application is running in the console.
   */
  isRunningInConsole (): boolean

  /**
   * Mark the application as running in the console.
   */
  markAsRunningInConsole (): this
}
