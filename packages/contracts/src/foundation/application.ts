'use strict'

import { ConfigStore } from '../config'

export interface Application {
  /**
   * Returns the app config store instance.
   *
   * @returns {ConfigStore}
   */
  config (): ConfigStore

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
