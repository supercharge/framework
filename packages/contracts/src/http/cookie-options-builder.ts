'use strict'

export type RequestCookieBuilderCallback = (cookieBuilder: RequestCookieBuilder) => void
export type ResponseCookieBuilderCallback = (cookieBuilder: ResponseCookieBuilder) => void

export interface RequestCookieBuilder {
  /**
   * Returns the cookie value for the given `name`.
   */
  unsigned(): this
}

export interface ResponseCookieBuilder {
  /**
   * Creates a cookie that expires in `time` milliseconds from now.
   */
  expiresIn(time: string | number): this

  /**
   * Creates a cookie that expires at the given `date` time in the future.
   */
  expiresAt(date: Date): this

  /**
   * The URL path on the server on which the cookie will be available.
   */
  path(path: string): this

  /**
   * The domain that the cookie will be available to.
   */
  domain(domain: string): this

  /**
   * Mark the cookie to be only available on HTTPS connections.
   */
  secure(): this

  /**
   * Mark the cookie to be available on HTTP and HTTPS connections.
   */
  unsecured(): this

  /**
   * Mark the cookie to be only accessible through the HTTP protocol
   * and not available to client-side JavaScript.
   */
  httpOnly(httpOnly?: boolean): this

  /**
   * Determine how the cookie behaves on cross-site requests.
   */
  sameSite(attribute: 'strict' | 'lax' | 'none' | true): this

  /**
   * The cookie will be signed using the app key.
   */
  signed(): this

  /**
   * The cookie will be sent in plain text.
   */
  unsigned(): this

  /**
   * Mark this cookie to overwrite any previously set cookie with the same name.
   */
  overwrite(): this
}
