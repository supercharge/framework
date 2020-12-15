'use strict'

import { extname } from 'path'
import RequireAll from 'require-all'
import { Application, Bootstrapper } from '@supercharge/contracts'

export class LoadConfiguration implements Bootstrapper {
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

    this.registerConfigBindings(app)
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
      filter: (file: string) => {
        /**
         * This `filter` method allows us to change the property name for
         * the loaded files. Returning the new name from this method
         * will be used as the key in the resulting object.
         *
         * E.g. an `app.ts` or `app.js` file will be translated into `app`
         * as the key in the resulting object: `{ app: {…} }`.
         */
        return this.isJavascriptOrTypescript(file)
          ? file.replace(extname(file), '')
          : false
      },
      resolve: (file: any) => {
        /**
         * This resolves any ESM default exports to avoid a `default` property
         * in the result. Example:
         *   `{ app: { default: {…} }` -> `{ app: { {…} }`
         */
        return this.esmResolve(file)
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

  /**
   * Resolves default exports and returns the file’s content.
   *
   * @param file
   *
   * @returns {*}
   */
  esmResolve (file: any): object {
    return file?.__esModule && file.default
      ? file.default
      : file
  }

  /**
   * Register the config store instance to the container.
   *
   * @param app
   */
  registerConfigBindings (app: Application): void {
    app.singleton('supercharge/config', () => app.config())
  }
}
