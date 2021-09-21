'use strict'

import * as Cookies from 'cookies'
import { tap } from '@supercharge/goodies'
import { RequestCookieBuilder, ResponseCookieBuilder } from './cookies'
import { CookieBag as CookieBagContract, CookieOptions, RequestCookieBuilderCallback, ResponseCookieBuilderCallback } from '@supercharge/contracts'

export class CookieBag implements CookieBagContract {
  /**
   * Stores the request attributes, like query or path parameters.
   */
  private readonly cookies: Cookies

  /**
   * Stores the default cookie options.
   */
  private readonly options: CookieOptions

  /**
   * Create a new instance.
   */
  constructor (cookies: Cookies, options?: CookieOptions) {
    this.cookies = cookies
    this.options = options ?? { signed: true }
  }

  /**
   * Returns the attribute value for the given `name` or the `defaultValue`.
   *
   * @param {String} name
   * @param {T} defaultValue
   *
   * @returns {T|undefined}
   */
  get (name: string, callback?: RequestCookieBuilderCallback): string | undefined {
    const options: Cookies.GetOption = { signed: true }

    if (typeof callback === 'function') {
      const builder = new RequestCookieBuilder(options)
      callback(builder)
    }

    return this.cookies.get(name, options)
  }

  /**
   * Set an attribute for the given `name` and assign the `value`.
   * This will override an existing attribute for the given `name`.
   *
   * @param {String} name
   * @param {String?} value
   *
   * @returns {HeaderBag}
   */
  set (name: string, value?: string | null, cookieBuilder?: ResponseCookieBuilderCallback): this {
    const options = this.mergedCookieOptions({ signed: true })

    if (typeof cookieBuilder === 'function') {
      const builder = new ResponseCookieBuilder(options)
      cookieBuilder(builder)
    }

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

  /**
   * Returns the merged cookie options from the default config and the given `options`.
   *
   * @param options
   *
   * @returns {CookieOptions}
   */
  private mergedCookieOptions (options?: CookieOptions): CookieOptions {
    return { ...this.options, ...options }
  }
}
