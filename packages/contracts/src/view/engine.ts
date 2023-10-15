
import { HelperDelegate } from 'handlebars'
import { ViewResponseConfig } from './response-config.js'

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
  render(view: string, data: any, config?: ViewResponseConfig): Promise<string>

  /**
   * Determine whether the given `view` template file exists.
   */
  exists(view: string): Promise<boolean>

  /**
   * Register a partial view with the given `name` and `content` to the view engine.
   */
  registerPartial (name: string, content: string): this

  /**
   * Determine whether a partial view with the given `name` is registered.
   */
  hasPartial (name: string): boolean

  /**
   * Register a view helper with the given `name` and `content` to the view engine.
   */
  registerHelper (name: string, fn: HelperDelegate): this

  /**
   * Determine whether a view helper with the given `name` is registered.
   */
  hasHelper (name: string): boolean

}
