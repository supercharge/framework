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
   * Returns the lowercased string value for the given `name`.
   *
   * @param name
   * @returns
   */
  private resolveName (name: keyof IncomingHttpHeaders): string {
    return String(name).toLowerCase()
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
      .map(name => this.resolveName(name))
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
  get<Header extends keyof IncomingHttpHeaders> (name: Header): IncomingHttpHeaders[Header]
  get<T, Header extends keyof IncomingHttpHeaders> (name: Header, defaultValue: T): IncomingHttpHeaders[Header] | T
  get<T, Header extends keyof IncomingHttpHeaders> (name: Header, defaultValue?: T): IncomingHttpHeaders[Header] | T {
    const key = this.resolveName(name)

    switch (key) {
      case 'referrer':
      case 'referer':
        return this.ctx.request.headers.referrer ?? this.ctx.request.headers.referer ?? defaultValue
      default:
        return this.ctx.request.headers[key] ?? defaultValue
    }
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
    const key = this.resolveName(name)

    return tap(this, () => {
      this.ctx.request.headers[key] = value
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
    const key = this.resolveName(name)

    return tap(this, () => {
      const { [key]: _, ...rest } = this.ctx.request.headers

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
