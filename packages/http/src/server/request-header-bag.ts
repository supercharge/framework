'use strict'

import { tap } from '@supercharge/goodies'
import { IncomingHttpHeaders } from 'http'
import { RouterContext } from '@koa/router'
import { Dict, RequestHeaderBag as RequestHeaderBagContract } from '@supercharge/contracts'

export class RequestHeaderBag implements RequestHeaderBagContract {
  /**
   * Stores the request headers as an object.
   */
  private readonly ctx: RouterContext

  /**
   * Create a new instance.
   */
  constructor (ctx: RouterContext) {
    this.ctx = ctx
  }

  /**
   * Returns an object with all `keys` existing in the input bag.
   *
   * @param keys
   *
   * @returns
   */
  all<Key extends keyof IncomingHttpHeaders = string> (...keys: Key[] | Key[][]): { [Key in keyof IncomingHttpHeaders]: IncomingHttpHeaders[Key] } {
    if (keys.length === 0) {
      return this.ctx.headers
    }

    return ([] as Key[])
      .concat(...keys)
      .reduce((carry: Dict<IncomingHttpHeaders[Key]>, key) => {
        carry[key] = this.get(key)

        return carry
      }, {})
  }

  /**
   * Returns the input value for the given `name`. Returns `undefined`
   * if the given `name` does not exist in the input bag.
   *
   * @param {Header} name
   * @param {Value} defaultValue
   *
   * @returns {Value | Dict<T>[Header] |undefined}
   */
  get<Header extends keyof IncomingHttpHeaders> (name: Header, defaultValue?: IncomingHttpHeaders[Header]): IncomingHttpHeaders[Header] {
    return this.ctx.request.headers[name] ?? defaultValue
  }

  /**
   * Set an input for the given `name` and assign the `value`. This
   * overrides a possibly existing input with the same `name`.
   *
   * @param {String} name
   * @param {*} value
   *
   * @returns {this}
   */
  set (name: string, value: any): this {
    return tap(this, () => {
      this.ctx.request.headers[name] = value
    })
  }

  /**
   * Removes the input with the given `name`.
   *
   * @param {String} name
   *
   * @returns {this}
   */
  remove (name: string): this {
    return tap(this, () => {
      const { [name]: _, ...rest } = this.ctx.request.headers

      this.ctx.request.headers = rest
    })
  }

  /**
   * Determine whether the HTTP header for the given `name` exists.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  has (name: keyof IncomingHttpHeaders): name is keyof IncomingHttpHeaders {
    return !!this.get(name)
  }

  /**
   * Returns an object containing all parameters.
   */
  toJSON (): Partial<IncomingHttpHeaders> {
    return this.all()
  }
}
