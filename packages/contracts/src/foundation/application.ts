'use strict'

export interface Application {
  /**
   * Returns the configuration path.
   *
   * @param {String} path - an optional path appended to the config path
   *
   * @returns {String}
   */
  configPath (path?: string): string

  /**
   * Returns the app version.
   *
   * @returns {String}
   */
  version(): string
}
