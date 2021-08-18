'use strict'

export interface ParameterBag {
  /**
   * Returns a HTTP headers object.
   */
  all(...keys: string[]): Record<string, any>

  /**
   * Returns the HTTP header value for the given `name`.
   */
  get<T = any>(name: string, defaultValue: T): T | undefined

  /**
   * Set an attribute for the given `name` and assign the `value`.
   * This will override an existing header for the given `name`.
   */
  set (name: string, value: any): ParameterBag

  /**
   * Determine whether an attribute for the given `name` exists.
   */
  has(name: string): boolean

  /**
   * Remove the attribute with the given `name`.
   */
  remove(name: string): ParameterBag
}
