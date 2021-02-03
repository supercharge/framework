'use strict'

import { Manager } from '@supercharge/manager'
import { HandlebarsCompiler } from './engines/handlebars'
import { Application, ViewEngine } from '@supercharge/contracts'

export class ViewManager extends Manager implements ViewEngine {
  /**
   * Create a new view manager instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    super(app)

    this.validateConfig()
  }

  /**
   * Validate the view config.
   *
   * @throws
   */
  private validateConfig (): void {
    this.ensureConfig('view', () => {
      throw new Error('Missing view configuration file. Make sure the "config/view.ts" file exists.')
    })

    this.ensureConfig('view.driver')
  }

  /**
   * Returns the default driver name.
   *
   * @returns {String}
   */
  defaultDriver (): string {
    return this.config().get('view.driver')
  }

  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   *
   * @param {String} name
   *
   * @returns {ViewEngine}
   */
  protected driver (name?: string): ViewEngine {
    return super.driver(name)
  }

  /**
   * Create a Handlebars view renderer instance.
   *
   * @returns {ViewEngine}
   */
  protected createHandlebarsDriver (): ViewEngine {
    return new HandlebarsCompiler(this.app)
  }

  /**
   * Render the given view.
   *
   * @param {String} view
   * @param {*} data
   *
   * @returns {String} the rendered view
   */
  async render (view: string, data?: any): Promise<string> {
    return await this.driver().render(view, data)
  }

  /**
   * Render the given view.
   *
   * @param {String} view
   * @param {*} data
   *
   * @returns {String} the rendered view
   */
  async exists (view: string): Promise<boolean> {
    return this.driver().exists(view)
  }

  /**
   * Boot the view engine driver.
   */
  async boot (): Promise<void> {
    await this.driver().boot()
  }
}
