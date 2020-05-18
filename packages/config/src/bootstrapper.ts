'use strict'

import Config from './index'
import RequireAll from 'require-all'
import { Application } from '@supercharge/contracts'

export = class ConfigBootstrapper {
  /**
   * Bootstrap the given application.
   *
   * @param {Application} app
   */
  async boot (app: Application): Promise<void> {
    Object.entries(
      this.loadConfigurationFiles(app)
    ).forEach(([key, value]) => {
      Config.set(key, value)
    })
  }

  /**
   * Load the configuration files from the disk.
   *
   * @param {Application} app
   *
   * @returns {object}
   */
  loadConfigurationFiles (app: Application): object {
    return RequireAll({
      dirname: app.configPath(),
      recursive: true,
      filter: /(.*)\.js|.ts$/
    })
  }
}
