'use strict'

import { extname, parse } from 'path'
import Fs from '@supercharge/filesystem'
import Collect from '@supercharge/collections'
import { esmRequire } from '@supercharge/goodies'
import { Application, Bootstrapper } from '@supercharge/contracts'

export class LoadConfiguration implements Bootstrapper {
  /**
   * Bootstrap the given application.
   *
   * @param {Application} app
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
   *
   * @param {Application} app
   *
   * @returns {object}
   */
  async loadConfigurations (app: Application): Promise<any> {
    return await this.resolve(
      await this.loadConfigurationFilesFromDisk(app)
    )
  }

  /**
   * Load the application’s configuration files from the local hard disk.
   *
   * @param {Application} app
   *
   * @returns {String[]}
   */
  async loadConfigurationFilesFromDisk (app: Application): Promise<string[]> {
    return await Fs.allFiles(
      app.configPath()
    )
  }

  /**
   * Load the configuration files from the disk.
   *
   * @param {Application} app
   *
   * @returns {object}
   */
  async resolve (configurationFiles: string[]): Promise<any> {
    return Collect(configurationFiles)
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
          name: parse(configFile).name,
          config: esmRequire(configFile)

        }
      })
  }

  /**
   * Determine whether the given file name is a JS or TS file.
   *
   * @param file
   *
   * @returns {Boolean}
   */
  isJavascriptOrTypescript (file: string): boolean {
    return file.endsWith('.d.ts')
      ? false
      : ['.js', '.ts'].includes(extname(file))
  }
}
