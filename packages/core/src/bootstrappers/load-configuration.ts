
import Fs from '@supercharge/fs'
import { Collect } from '@supercharge/collections'
import { resolveDefaultImport } from '@supercharge/goodies'
import { Application, Bootstrapper } from '@supercharge/contracts'

export class LoadConfiguration implements Bootstrapper {
  /**
   * Bootstrap the given application.
   */
  async bootstrap (app: Application): Promise<void> {
    ([] as any[]).concat(
      await this.loadConfigurations(app)
    ).forEach(({ name, config }) => {
      app.config().set(name, config)
    })
  }

  /**
   * Load the configuration files from the disk.
   */
  async loadConfigurations (app: Application): Promise<any> {
    return await this.resolve(
      await this.loadConfigurationFilesFromDisk(app)
    )
  }

  /**
   * Load the application’s configuration files from the local hard disk.
   */
  async loadConfigurationFilesFromDisk (app: Application): Promise<string[]> {
    return await Fs.allFiles(
      app.configPath()
    )
  }

  /**
   * Load the configuration files from the disk.
   */
  async resolve (configurationFiles: string[]): Promise<any> {
    return await Collect(configurationFiles)
      .filter(configFile => {
        /**
         * This `filter` method allows us to change the property name for
         * the loaded files. Returning the new name from this method
         * will be used as the key in the resulting object.
         *
         * E.g. an `app.ts` or `app.js` file will be translated into `app`
         * as the key in the resulting object: `{ app: {…} }`.
         */
        return this.isJavascriptOrTypescript(configFile)
      })
      .map(async configFile => {
        /**
         * This resolves any ESM default exports to avoid a `default` property
         * in the result. Example:
         *   `{ app: { default: {…} }` -> `{ app: { {…} }`
         */
        return {
          name: Fs.filename(configFile),
          config: await resolveDefaultImport(configFile)
        }
      })
  }

  /**
   * Determine whether the given file name is a JS or TS file.
   */
  isJavascriptOrTypescript (file: string): boolean {
    if (file.endsWith('.d.ts')) {
      return false
    }

    return ['.js', '.ts'].includes(
      Fs.extension(file)
    )
  }
}
