'use strict'

import Dotenv from 'dotenv'
import Fs from '@supercharge/fs'
import { Application, Bootstrapper } from '@supercharge/contracts'

export class LoadEnvironmentVariables implements Bootstrapper {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * Create a new instance.
   *
   * @param app Application
   */
  constructor (app: Application) {
    this.app = app
  }

  /**
   * Boot application services.
   */
  async bootstrap (): Promise<void> {
    await this.loadEnvironment()
  }

  /**
   * Load the contents of the configured environment file. Throws an error
   * in case the environment file does not exist, an error will be thrown.
   *
   * @throws
   */
  async loadEnvironment (): Promise<void> {
    await this.ensureEnvironmentFileExists()

    Dotenv.config({ path: this.environmentFile() })
  }

  /**
   * Throws if the environment file does not exists.
   *
   * @throws
   */
  async ensureEnvironmentFileExists (): Promise<void> {
    if (await Fs.notExists(this.environmentFile())) {
      throw new Error(`Invalid environment file. Cannot find env file "${this.environmentFile()}".`)
    }
  }

  /**
   * Returns the application’s environment file. By default: `.env`.
   */
  environmentFile (): string {
    return this.app.environmentFile()
  }
}
