'use strict'

import { ViewConfig } from './config'
import { HelperDelegate } from 'handlebars'

export interface ViewEngine {
  /**
   * Boot the view engine. This may contain loading partial views
   * or view helpers. Anything that need’s to be done during a
   * setup phase belongs into this helpful lifecycle method.
   */
  boot(): Promise<void>

  /**
   * Returns the rendered HTML view.
   */
  render(view: string, data: any, config?: ViewConfig): Promise<string>

  /**
   * Determine whether the given `view` template file exists.
   */
  exists(view: string): Promise<boolean>

  /**
   * Register a partial view with the given `name` and `content` to the view engine.
   */
  registerPartial (name: string, content: string): this

  /**
   * Register a view helper with the given `name` and `content` to the view engine.
   */
  registerHelper (name: string, fn: HelperDelegate): this
}
