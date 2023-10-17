
import Cookie from 'cookie'
import * as Cookies from 'cookies'
import { tap } from '@supercharge/goodies'
import { RequestCookieBuilder, ResponseCookieBuilder } from './cookies/index.js'
import { CookieBag as CookieBagContract, CookieOptions, RequestCookieBuilderCallback, ResponseCookieBuilderCallback } from '@supercharge/contracts'

export class CookieBag implements CookieBagContract {
  /**
   * Stores the request cookies.
   */
  private readonly cookies: Cookies

  /**
   * Stores the default cookie options.
   */
  private readonly options: CookieOptions & { signed: boolean }

  /**
   * Create a new instance.
   */
  constructor (cookies: Cookies, options?: CookieOptions) {
    this.cookies = cookies
    this.options = { signed: true, ...options }
  }

  /**
   * Returns the attribute value for the given `name` or the `defaultValue`.
   *
   * @param {String} name
   * @param {RequestCookieBuilderCallback} callback
   *
   * @returns {String|undefined}
   */
  get (name: string, callback?: RequestCookieBuilderCallback): string | undefined {
    if (typeof callback === 'function') {
      const builder = new RequestCookieBuilder(this.options)
      callback(builder)
    }

    return this.cookies.get(name, this.options)
  }

  /**
   * Set an attribute for the given `name` and assign the `value`.
   * This will override an existing attribute for the given `name`.
   *
   * @param {String} name
   * @param {String?} value
   *
   * @returns {ThisType}
   */
  set (name: string, value?: string | null, cookieBuilder?: ResponseCookieBuilderCallback): this {
    if (typeof cookieBuilder === 'function') {
      const builder = new ResponseCookieBuilder(this.options)
      cookieBuilder(builder)
    }

    return tap(this, () => {
      this.cookies.set(name, value, this.options)
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
    const parsed = Cookie.parse(this.cookies.request.headers.cookie ?? '')

    return !!parsed[name]
  }

  /**
   * Deletes a cookie with the given `name`.
   *
   * @param {String} name
   *
   * @returns {this}
   */
  delete (name: string): this {
    return this.set(name, undefined)
  }
}
