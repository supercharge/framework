'use strict'

import * as Cookies from 'cookies'
import { tap } from '@supercharge/goodies'
import { RequestCookieBuilder } from './cookies/request-cookie-builder'
import { CookieBag as CookieBagContract, RequestCookieBuilderCallback } from '@supercharge/contracts'

export class CookieBag implements CookieBagContract {
  /**
   * Stores the request attributes, like query or path parameters.
   */
  private readonly cookies: Cookies

  /**
   * Create a new instance.
   */
  constructor (cookies: Cookies) {
    this.cookies = cookies
  }

  /**
   * Returns the attribute value for the given `name` or the `defaultValue`.
   *
   * @param {String} name
   * @param {T} defaultValue
   *
   * @returns {T|undefined}
   */
  get (name: string, cookieBuilder?: RequestCookieBuilderCallback): string | undefined {
    const options: Cookies.GetOption = { signed: true }
    const builder = new RequestCookieBuilder(options)

    if (typeof cookieBuilder === 'function') {
      cookieBuilder(builder)
    }

    return this.cookies.get(name, options)
  }

  /**
   * Set an attribute for the given `name` and assign the `value`.
   * This will override an existing attribute for the given `name`.
   *
   * @param {String} name
   * @param {String|String[]} value
   *
   * @returns {HeaderBag}
   */
  // set (name: string, value?: string, cookieBuilder?: ResponseCookieBuilderCallback): this {
  set (name: string, value?: string, options?: any): this {
    return tap(this, () => {
      this.cookies.set(name, value, options)
    })
  }

  /**
   * Determine whether the attribute for the given `name` exists.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  has (name: string): boolean {
    return !!this.get(name)
  }
}
