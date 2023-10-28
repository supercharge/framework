
/**
 * This interface defines key-value-pairs stored in the shared request state.
 * Extend this interface in a userland typing file and use TypeScript’s
 * declaration merging features to provide IntelliSense in the app.
 *
 * We’re not using a `Record`-like interface with an index signature, because
 * the index signature would resolve all keys to the `any` type. Using the
 * empty interface allows everyone to merge their interface definitions.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpStateData {
  //
}

export interface StateBag<State = HttpStateData> {
  /**
   * Returns the state object.
   */
  all (): State
  all<K extends keyof State> (...keys: K[]): Pick<State, K>
  all<R = Record<string, any>> (...keys: string[]): R

  /**
   * Returns the saved state for the given `name`.
   */
  get<K extends keyof State> (name: K): State[K] extends undefined ? undefined : State[K]
  get<R = any> (name: string, defaultValue?: R): R

  /**
   * Add a key-value-pair to the shared state or an object of key-value-pairs.
   */
  add<K extends keyof State> (key: K, value: State[K]): this
  add (key: string, value: any): this
  add (values: State): this

  /**
   * Merge the given `data` object with the existing shared state.
   */
  merge (data: Record<string, any>): this

  /**
   * Determine whether the state bag contains an item for the given `key`.
   */
  exists<K extends keyof State> (key: K): K extends undefined ? false : true
  exists (key: string): boolean

  /**
   * Determine whether a shared state item exists for the given `name`.
   */
  has<K extends keyof State> (name: K): State[K] extends undefined ? false : true
  has (name: string): boolean

  /**
   * Determine whether the shared state is missing an item for the given `name`.
   */
  isMissing<K extends keyof State> (name: K): State[K] extends undefined ? true : false
  isMissing (name: string): boolean

  /**
   * Remove the shared state item for the given `name`.
   */
  remove<K extends keyof State> (name: K): this
  remove (name: string): this

  /**
   * Removes all shared state items.
   */
  clear(): this
}
