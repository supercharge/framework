
import Path from 'node:path'
import Fs from '@supercharge/fs'
import { parseEnv } from 'node:util'
import { Str } from '@supercharge/strings'
import { Application, Bootstrapper } from '@supercharge/contracts'
import { EnvironmentFileError } from '../errors/environment-file-error.js'

export class LoadEnvironmentVariables implements Bootstrapper {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * Create a new instance.
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
   */
  async loadEnvironment (): Promise<void> {
    await this.loadDefaultEnvironmentFile()
    await this.loadSpecificEnvironmentFile()
  }

  /**
   * Load the app’s configured environment file.
   */
  async loadDefaultEnvironmentFile (): Promise<void> {
    const envPath = this.app.environmentFilePath()

    if (await Fs.notExists(envPath)) {
      throw new EnvironmentFileError(`Invalid environment file. Cannot find env file "${envPath}".`)
    }

    await this.loadEnvironmentFile(envPath)
  }

  /**
   * Load the environment file from the given `path` into `process.env`.
   */
  async loadEnvironmentFile (envFilePath: string): Promise<void> {
    const content = await Fs.content(envFilePath)
    const environmentVariables = parseEnv(content)

    Object.entries(environmentVariables).forEach(([key, value]) => {
      process.env[key] = value
    })
  }

  /**
   * Check if an environment file exists for the configured `NODE_ENV`. For example,
   * if `NODE_ENV=testing`, check whether a `.env.testing` file exists and loadd it.
   */
  async loadSpecificEnvironmentFile (): Promise<void> {
    const env = this.app.env().get('NODE_ENV').toLowerCase()

    if (!env) {
      return
    }

    const envFilePath = Path.isAbsolute(this.app.environmentPath())
      ? Str(this.app.environmentPath()).rtrim('/').finish('/').concat(`.env.${env}`).get()
      : this.app.resolveFromBasePath(this.app.environmentPath(), `.env.${env}`)

    if (await Fs.exists(envFilePath)) {
      await this.loadEnvironmentFile(envFilePath)
    }
  }
}
