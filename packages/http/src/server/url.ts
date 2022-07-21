'use strict'

import { URL as WhatwgUrl } from 'url'
import { URL as UrlContract } from '@supercharge/contracts'

export class URL implements UrlContract {
  /**
   * Stores the WHATWG URL instance.
   */
  private readonly url: WhatwgUrl

  /**
   * Create a new instance for the given `input` and `base`.
   */
  constructor (input: string, base?: string) {
    this.url = new WhatwgUrl(input, base)
  }

  /**
   * Returns the fragment portion of the URL.
   */
  hash (): string {
    return this.url.hash
  }

  /**
   * Returns the host portion of the URL. The host may contain a port if one is present in the URL.
   */
  host (): string {
    return this.url.host
  }

  /**
   * Returns the host name portion of the URL. The difference between `url.host()`
   * and `url.hostname()` is that the hostname doesn’t include the port number.
   */
  hostname (): string {
    return this.url.hostname
  }

  /**
   * Returns the serialized, full URL. This part is called `href` in the WHATWG URL specification.
   */
  full (): string {
    return this.url.href
  }

  /**
   * Returns the serialized URL.
   */
  origin (): string {
    return this.url.origin
  }

  /**
   * Returns the password portion of the URL.
   */
  password (): string {
    return this.url.password
  }

  /**
   * Returns the path portion of the URL.
   */
  path (): string {
    return this.url.pathname
  }

  /**
   * Returns the port portion of the URL. The port value can be a number or a
   * string containing a number in the range of `0` to `65535` (inclusive).
   *
   * The port value can be an empty string in which case the port depends on
   * the protocol/scheme. Default ports for the individual schemes return
   * an empty string.
   */
  port (): string | number {
    const port = Number(this.url.port)

    return !port
      ? this.url.port
      : port
  }

  /**
   * Returns the protocol portion of the URL.
   */
  protocol (): string {
    return this.url.protocol
  }

  /**
   * Returns the query string portion of the URL.
   */
  search (): string {
    return this.url.search
  }

  /**
   * Returns the username portion of the URL.
   */
  username (): string {
    return this.url.username
  }

  /**
   * Returns the serialized URL. The returned value is equivalent to the value returned by {@link full}.
   */
  toString (): string {
    return this.url.toString()
  }

  /**
   * Returns the serialized URL.
   */
  toJSON (): string {
    return this.url.toJSON()
  }
}
