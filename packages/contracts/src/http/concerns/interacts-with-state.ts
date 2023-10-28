
import { StateBag, HttpStateData } from './state-bag.js'

export interface InteractsWithState<State = HttpStateData> {
  /**
   * Share a given `state` across HTTP requests. Any previously
   * set state will be merged with the given `state`.
   *
   * @example
   * ```
   * response.share({ user: { id: 1, name: 'Marcus' } })
   * ```
   */
  share<K extends keyof State> (key: K, value: State[K]): this
  share (values: Partial<State>): this
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
  state (): StateBag<State>
}
