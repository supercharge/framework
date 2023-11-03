
import { HelperDelegate } from 'handlebars'
import { ViewResponseConfig } from './response-config.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ViewSharedData {
  //
}

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

  /**
   * Share a given state of data to all views, across HTTP requests.
   *
   * @example
   * ```
   * import { View } from '@supercharge/facades'
   *
   * View.share({ key: 'value' })
   * ```
   */
  share<K extends keyof ViewSharedData> (key: K, value: ViewSharedData[K]): this
  share (values: Partial<ViewSharedData>): this
  share (key: string | any, value?: any): this

  /**
   * Returns the shared data.
   */
  sharedData(): Record<string, any>
}
