'use strict'

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
  render(view: string, data?: any): Promise<string>

  /**
   * Determine whether the given `view` template file exists.
   */
  exists(view: string): Promise<boolean>
}
