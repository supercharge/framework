'use strict'

import { tap } from '@supercharge/goodies'
import { IncomingHttpHeaders } from 'http'
import { HeaderBag as HeaderBagContract } from '@supercharge/contracts'

export class HeaderBag implements HeaderBagContract {
  /**
   * Stores the request headers as an object.
   */
  private readonly headers: IncomingHttpHeaders

  /**
   * Create a new instance.
   */
  constructor (headers: IncomingHttpHeaders) {
    this.headers = headers
  }

  /**
   * Returns a HTTP headers object.
   */
  all (...keys: Array<keyof IncomingHttpHeaders>): IncomingHttpHeaders {
    if (keys.length === 0) {
      return this.headers
    }

    return keys.reduce((carry: Record<string, any>, key) => {
      carry[key] = this.get(key)

      return carry
    }, {})
  }

  /**
   * Returns the HTTP header value for the given `name`.
   *
   * @param {String} name
   * @param {String|String[]} defaultValue
   *
   * @returns {String|String[]|undefined}
   */
  get<Header extends keyof IncomingHttpHeaders> (name: Header, defaultValue?: any): IncomingHttpHeaders[Header] {
    return this.headers[name] ?? defaultValue
  }

  /**
   * Set an HTTP header for the given `name` and assign the `value`.
   * This will override an existing header for the given `name`.
   *
   * @param {String} name
   * @param {String|String[]} value
   *
   * @returns {HeaderBag}
   */
  set (name: string, value: string | string[]): HeaderBag {
    return tap(this, () => {
      this.headers[name] = value
    })
  }

  /**
   * Determine whether the HTTP header for the given `name` exists.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  has (name: keyof IncomingHttpHeaders): boolean {
    return !!this.get(name)
  }
}
