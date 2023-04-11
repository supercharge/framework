'use strict'

/**
 * This interface defines key-value-pairs stored in the shared request state.
 * Extend this interface in a userland typing file and use TypeScript’s
 * declaration merging features to provide IntelliSense in the app.
 *
 * We can’t use a Record-like interface with an index signature, because the
 * index signature allows
 */
export type RequestStateData = any

export interface StateBag {
  /**
   * Returns the state object.
   */
  all<K extends keyof RequestStateData> (...keys: K[]): Pick<RequestStateData, K>
  all<R = Record<string, any>> (...keys: string[]): R

  /**
   * Returns the saved state for the given `name`.
   */
  get<K extends keyof RequestStateData> (name: K): RequestStateData[K]
  get<R = any> (name: string, defaultValue?: R): R

  /**
   * Add a key-value-pair to the shared state or an object of key-value-pairs.
   */
  add<K extends keyof RequestStateData> (key: K, value: RequestStateData[K]): this
  add (key: string, value: any): this
  add (values: RequestStateData): this

  /**
   * Merge the given `data` object with the existing shared state.
   */
  merge (data: Record<string, any>): this

  /**
   * Determine whether a shared state item exists for the given `name`.
   */
  has<K extends keyof RequestStateData> (name: K): boolean
  has (name: string): boolean

  /**
   * Determine whether the shared state is missing an item for the given `name`.
   */
  isMissing<K extends keyof RequestStateData> (name: K): boolean
  isMissing (name: string): boolean

  /**
   * Remove the shared state item for the given `name`.
   */
  remove<K extends keyof RequestStateData> (name: K): this
  remove (name: string): this

  /**
   * Removes all shared state items.
   */
  clear(): this
}
