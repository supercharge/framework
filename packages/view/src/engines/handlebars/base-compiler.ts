
import { ViewSharedData } from '@supercharge/contracts'

export class ViewBaseCompiler {
  /**
   * Stores the data that is available to all view templates.
   */
  private state: Record<string, any> = {}

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
  share (key: string | any, value?: any): this {
    if (this.isObject(key)) {
      this.state = { ...this.state, ...key }
    } else if (typeof key === 'string') {
      this.state[key] = value
    } else {
      throw new Error(`Failed to set shared view state: the first argument is neither a string nor an object. Received "${typeof key}"`)
    }

    return this
  }

  /**
   * Returns the shared data.
   */
  sharedData (): Record<string, any> {
    return this.state
  }

  /**
   * Determine whether the given `input` is an object.
   */
  private isObject (input: any): input is Record<string, any> {
    return !!input && input.constructor.name === 'Object'
  }
}
