'use strict'

import { StateBag } from './state-bag'

export interface InteractsWithState {
  /**
   * Share a given `state` across HTTP requests. Any previously
   * set state will be merged with the given `state`.
   *
   * @example
   * ```
   * response.share({ user: { id: 1, name: 'Marcus' } })
   * ```
   */
  share (key: string | any, value?: any): this

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
  state (): StateBag
}
