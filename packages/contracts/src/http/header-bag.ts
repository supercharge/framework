'use strict'

import { IncomingHttpHeaders } from 'http'

export interface HeaderBag {
  /**
   * Returns a HTTP headers object.
   */
  all(): IncomingHttpHeaders

  /**
   * Returns the HTTP header value for the given `name`.
   */
  get(name: string, defaultValue: string | string[]): string | string[] | undefined

  /**
   * Set an HTTP header for the given `name` and assign the `value`.
   * This will override an existing header for the given `name`.
   */
  set (name: string, value: string | string[]): HeaderBag

  /**
   * Determine whether the HTTP header for the given `name` exists.
   */
  has(name: string): boolean
}
