'use strict'

export interface URLCtor {
  /**
   * Create a new URL instance.
   */
  new (input: string, base?: string | URL): URL

  parse (input: string, base?: string | URL): URL
}

export interface URL {
  /**
   * Returns the fragment portion of the URL.
   *
   * @example
   * ```ts
   * const url = new URL('http://example.com/login#foo')
   *
   * url.hash()
   * // #foo
   * ```
   */
  hash (): string

  /**
   * Returns the host portion of the URL.
   *
   * @example
   * ```ts
   * const url = new URL('http://example.com:8080/login')
   *
   * url.host()
   * // example.com:8080
   * ```
   */
  host (): string

  /**
   * Returns the host name portion of the URL. The difference between `url.host()`
   * and `url.hostname()` is that the hostname doesn’t include the port number.
   *
   * @example
   * ```ts
   * const url = new URL('http://example.com:8080/login')
   *
   * url.hostname()
   * // example.com
   * ```
   */
  hostname (): string

  /**
   * Returns the serialized, full URL. This part is called `href` in the WHATWG URL specification.
   *
   * @example
   * ```ts
   * const url = new URL('http://example.com:8080/login?foo=bar')
   *
   * url.full()
   * // http://example.com:8080/login?foo=bar
   * ```
   */
  full (): string

  /**
   * Returns the serialized URL.
   *
   * @example
   * ```ts
   * new URL('http://example.com:8080/login').origin()
   * // http://example.com:8080/login
   *
   * new URL('https://測試').origin()
   * // https://xn--g6w251d
   * ```
   */
  origin (): string

  /**
   * Returns the password portion of the URL.
   *
   * @example
   * ```ts
   * const url = new URL('http://user:pass@example.com/login')
   *
   * url.password()
   * // pass
   * ```
   */
  password (): string

  /**
   * Returns the path portion of the URL.
   *
   * @example
   * ```ts
   * new URL('http://user:pass@example.com/account/login?foo=bar').path()
   * // /account/login
   * ```
   */
  path (): string

  /**
   * Returns the port portion of the URL. The port value can be a number or a
   * string containing a number in the range of `0` to `65535` (inclusive).
   *
   * The port value can be an empty string in which case the port depends on
   * the protocol/scheme. Default ports for the individual schemes return
   * an empty string.
   *
   * @example
   * ```ts
   * new URL('http://example.com:8080/login').port()
   * // 8080
   *
   * new URL('http://example.com/login').port()
   * // ''
   *
   * new URL('https://example.com/login').port()
   * // ''
   * ```
   */
  port (): number | string

  /**
   * Returns the protocol portion of the URL.
   *
   * @example
   * ```ts
   * const url = new URL('http://user:pass@example.com/login')
   *
   * url.protocol()
   * // http
   * ```
   */
  protocol (): string

  /**
   * Returns the query string portion of the URL.
   *
   * @example
   * ```ts
   * const url = new URL('http://user:pass@example.com/login?foo=bar')
   *
   * url.search()
   * // ?foo=bar
   * ```
   */
  search (): string

  /**
   * Returns the username portion of the URL.
   *
   * @example
   * ```ts
   * const url = new URL('http://user:pass@example.com/login')
   *
   * url.username()
   * // user
   * ```
   */
  username (): string

  /**
   * Returns the serialized URL. The returned value is equivalent to the value returned by {@link full}.
   *
   * @example
   * ```ts
   * const url = new URL('http://example.com:8080/login?foo=bar')
   *
   * url.full()
   * // http://example.com:8080/login?foo=bar
   * ```
   */
  toString (): string

  /**
   * Returns the serialized URL.
   *
   * @example
   * ```ts
   * const url = new URL('http://example.com:8080/login?foo=bar')
   *
   * url.full()
   * // http://example.com:8080/login?foo=bar
   * ```
   */
  toJSON (): string
}
