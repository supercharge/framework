'use strict'

import Dotenv from 'dotenv'
import Fs from '@supercharge/filesystem'
import { Application, Bootstrapper } from '@supercharge/contracts'

export class LoadEnvironmentVariables implements Bootstrapper {
  /**
   * Boot application services.
   */
  async bootstrap (app: Application): Promise<void> {
    await this.loadEnvironment(app)
  }

  /**
   * Determine whether a custom environment file.
   */
  async loadEnvironment (app: Application): Promise<void> {
    await this.ensureEnvironmentFileExists(app)

    Dotenv.config({ path: this.environmentFile(app) })
  }

  /**
   * Throws if the environment file does not exists.
   *
   * @throws
   */
  async ensureEnvironmentFileExists (app: Application): Promise<void> {
    if (await Fs.exists(this.environmentFile(app))) {
      return
    }

    throw new Error(`Invalid environment file. Cannot find env file "${this.environmentFile(app)}".`)
  }

  /**
   * Returns the application’s environment file. By default: `.env`.
   *
   * @returns {String}
   */
  environmentFile (app: Application): string {
    return app.environmentFile()
  }
}
