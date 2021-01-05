'use strict'

import { Manager } from '@supercharge/manager'
import { ViewEngine } from '@supercharge/contracts'
import { HandlebarsCompiler } from './engines/handlebars'

export class ViewManager extends Manager {
  /**
   * Returns the default driver name.
   *
   * @returns {String}
   */
  defaultDriver (): string {
    return this.app.config().get('view.driver')
  }

  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   *
   * @param {String} name
   *
   * @returns {ViewEngine}
   */
  driver (name?: string): ViewEngine {
    return super.driver(name)
  }

  /**
   * Create a Handlebars view renderer instance.
   *
   * @returns {ViewEngine}
   */
  createHandlebarsDriver (): ViewEngine {
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
   * Boot the view engine driver.
   */
  async boot (): Promise<void> {
    await this.driver().boot()
  }
}
