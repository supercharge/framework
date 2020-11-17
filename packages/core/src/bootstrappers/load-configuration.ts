'use strict'

import RequireAll from 'require-all'
import { Application, Bootstrapper } from '@supercharge/contracts'

export class ConfigBootstrapper implements Bootstrapper {
  /**
   * Bootstrap the given application.
   *
   * @param {Application} app
   */
  async bootstrap (app: Application): Promise<void> {
    Object.entries(
      this.loadConfigurationFiles(app)
    ).forEach(([key, value]) => {
      app.config().set(key, value)
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
      dirname: app.configPath(''),
      recursive: true,
      filter: /(.*)\.js|.ts$/
    })
  }
}
