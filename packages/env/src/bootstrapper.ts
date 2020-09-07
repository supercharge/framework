'use strict'

import Dotenv from 'dotenv'
import Fs from '@supercharge/filesystem'
import DotenvExpand from 'dotenv-expand'
import { Application } from '@supercharge/contracts'

export class EnvBootstrapper {
  /**
   * Bootstrap the given application.
   *
   * @param {Application} app
   */
  async boot (app: Application): Promise<void> {
    await this.loadEnvironment(app)
  }

  /**
   * Determine whether a custom environment file.
   *
   * @param app
   */
  async loadEnvironment (app: Application): Promise<void> {
    await this.ensureEnvironmentFileExists(app)

    const env = Dotenv.config({ path: app.environmentFile() })
    DotenvExpand(env)
  }

  /**
   * Throws if the environment file does not exists.
   *
   * @param app
   *
   * @throws
   */
  async ensureEnvironmentFileExists (app: Application): Promise<void> {
    if (await Fs.notExists(app.environmentFile())) {
      throw new Error(`Invalid environment file. Cannot find "${app.environmentFile()}".`)
    }
  }
}
