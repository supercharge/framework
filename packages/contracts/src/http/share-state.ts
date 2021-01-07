'use strict'

export interface ShareState {
  /**
   * Share a given `state` across HTTP requests. Any previously
   * set state will be merged with the given `state`.
   *
   * @example
   * ```
   * response.share({ user: { id: 1, name: 'Marcus' } })
   * ```
   */
  share (state: any): this

  /**
   * Returns the shared HTTP context state.
   *
   * @example
   * ```
   * response.state()
   *
   * // something like "{ app: {…}, user: {…} }"
   * ```
   */
  state (): any
}
