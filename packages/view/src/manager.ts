'use strict'

import { tap } from '@supercharge/goodies'
import { HelperDelegate } from 'handlebars'
import { Manager } from '@supercharge/manager'
import { HandlebarsCompiler } from './engines/handlebars'
import { Application, ViewEngine, ViewResponseConfig } from '@supercharge/contracts'

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
  protected override driver (name?: string): ViewEngine {
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
   * @param {ViewConfig} config
   *
   * @returns {String} the rendered view
   */
  async render (view: string, data: any, config?: ViewResponseConfig): Promise<string> {
    return await this.driver().render(view, data, config)
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
    return await this.driver().exists(view)
  }

  /**
   * Register a partial view with the given `name` and `content` to the handlebars engine.
   *
   * @param {String} name
   * @param {String} content
   *
   * @returns {this}
   */
  registerPartial (name: string, content: string): this {
    return tap(this, () => {
      this.driver().registerPartial(name, content)
    })
  }

  /**
   * Determine whether a partial view with the given `name` is registered.
   *
   * @param {string} name
   */
  hasPartial (name: string): boolean {
    return this.driver().hasPartial(name)
  }

  /**
   * Register a view helper with the given `name` and `content` to the view engine.
   *
   * @param {String} name
   * @param {HelperDelegate} fn
   *
   * @returns {this}
   */
  registerHelper (name: string, fn: HelperDelegate): this {
    return tap(this, () => {
      this.driver().registerHelper(name, fn)
    })
  }

  /**
   * Determine whether a view helper with the given `name` is registered.
   *
   * @param {string} name
   */
  hasHelper (name: string): boolean {
    return this.driver().hasHelper(name)
  }

  /**
   * Boot the view engine driver.
   */
  async boot (): Promise<void> {
    await this.driver().boot()
  }
}
