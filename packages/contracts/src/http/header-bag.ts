'use strict'

import { IncomingHttpHeaders } from 'http'

export interface HeaderBag {
  /**
   * Returns a HTTP headers object.
   */
  all(...keys: Array<keyof IncomingHttpHeaders>): IncomingHttpHeaders

  /**
   * Returns the HTTP header value for the given `name`.
   */
  get<Header extends keyof IncomingHttpHeaders> (name: Header, defaultValue?: any): IncomingHttpHeaders[Header]

  /**
   * Set an HTTP header for the given `name` and assign the `value`.
   * This will override an existing header for the given `name`.
   */
  set (name: string, value: any): HeaderBag

  /**
   * Determine whether the HTTP header for the given `name` exists.
   */
  has(name: keyof IncomingHttpHeaders): boolean
}
