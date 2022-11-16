'use strict'

import { RequestCookieBuilderCallback, ResponseCookieBuilderCallback } from './cookie-options-builder'

export interface CookieBag {
  /**
   * Returns the cookie value for the given `name` if a cookie with that name
   * exists, `undefined` otherwise. Use a cookie options builder as the
   * second argument to customize the retrieval of the given cookie.
   */
  get (name: string, cookieBuilder?: RequestCookieBuilderCallback): string | undefined

  /**
   * Set a response cookie with the given `name` and assign the `value`.
   */
  set (name: string, value?: string, cookieBuilder?: ResponseCookieBuilderCallback): this

  /**
   * Determine whether a cookie exists for the given `name`.
   */
  has(name: string): boolean

  /**
   * Removes a cookie with the given `name`.
   */
  delete(name: string): this
}
