'use strict'

import { RequestState } from './request-state'

export interface StateBag<Entries extends RequestState = {}> {
  /**
   * Returns the state object.
   */
  all(...keys: Array<keyof Entries | string>): Record<string, any>

  /**
   * Returns the saved state for the given `name`.
   */
  get<R = any>(name: keyof Entries | string): R | undefined
  get<R = any>(name: keyof Entries | string, defaultValue: R): R

  /**
   * Add a key-value-pair to the shared state or an object of key-value-pairs.
   */
  add (values: Record<string, any>): this
  add (key: keyof Entries | string, value: any): this

  /**
   * Merge the given `data` object with the existing shared state.
   */
  merge (data: Record<string, any>): this

  /**
   * Determine whether a shared state item exists for the given `name`.
   */
  has(name: keyof Entries | string): name is keyof Entries
  /**
   * Determine whether the shared state is missing an item for the given `name`.
   */
  isMissing (name: keyof Entries | string): name is string

  /**
   * Remove the shared state item for the given `name`.
   */
  remove(name: keyof Entries | string): this

  /**
   * Removes all shared state items.
   */
  clear(): this
}
