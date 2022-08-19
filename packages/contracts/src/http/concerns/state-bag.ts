'use strict'

export interface StateBag {
  /**
   * Returns the state object.
   */
  all(...keys: string[]): Record<string, any>

  /**
   * Returns the saved state for the given `name`.
   */
  get<R = any>(name: string): R | undefined

  /**
   * Add a key-value-pair to the shared state or an object of key-value-pairs.
   */
  add (name: string | Record<string, any>, value?: any): this

  /**
   * Merge the given `data` object with the existing shared state.
   */
  merge (data: Record<string, any>): this

  /**
   * Determine whether a shared state item exists for the given `name`.
   */
  has(name: string): boolean
  /**
   * Determine whether the shared state is missing an item for the given `name`.
   */
  isMissing (name: string): boolean

  /**
   * Remove the shared state item for the given `name`.
   */
  remove(name: string): this

  /**
   * Removes all shared state items.
   */
  clear(): this
}
