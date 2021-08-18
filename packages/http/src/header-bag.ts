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
  all (...keys: string[]): IncomingHttpHeaders {
    if (keys.length === 0) {
      return this.headers
    }

    return keys.reduce((carry: Record<string, any>, key: string) => {
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
  get (name: string, defaultValue?: string | string[]): string | string[] | undefined {
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
  has (name: string): boolean {
    return !!this.get(name)
  }
}
