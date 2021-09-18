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
   * Tba.
   */
  /**
   * a number representing the milliseconds from Date.now() for expiry
   */
  maxAge(age: number): this

  /**
   * a Date object indicating the cookie's expiration
   * date (expires at the end of session by default).
   */
  expires(date: Date): this

  /**
   * a string indicating the path of the cookie (/ by default).
   */
  path(path: string): this

  /**
   * a string indicating the domain of the cookie (no default).
   */
  domain(domain: string): this

  /**
   * a boolean indicating whether the cookie is only to be sent
   * over HTTPS (false by default for HTTP, true by default for HTTPS).
   */
  secure(secure: boolean): this

  /**
   * "secureProxy" option is deprecated; use "secure" option, provide "secure" to constructor if needed
   */
  secureProxy(secureProxy: boolean): this

  /**
   * a boolean indicating whether the cookie is only to be sent over HTTP(S),
   * and not made available to client JavaScript (true by default).
   */
  httpOnly(httpOnly: boolean): this

  /**
   * a boolean or string indicating whether the cookie is a "same site" cookie (false by default).
   * This can be set to 'strict', 'lax', or true (which maps to 'strict').
   */
  sameSite(attribute: 'strict' | 'lax' | 'none' | boolean): this

  /**
   * a boolean indicating whether the cookie is to be signed (false by default).
   * If this is true, another cookie of the same name with the .sig suffix
   * appended will also be sent, with a 27-byte url-safe base64 SHA1 value
   * representing the hash of cookie-name=cookie-value against the first Keygrip key.
   * This signature key is used to detect tampering the next time a cookie is received.
   */
  signed(signed: boolean): this

  /**
   * a boolean indicating whether to overwrite previously set
   * cookies of the same name (false by default). If this is true,
   * all cookies set during the same request with the same
   * name (regardless of path or domain) are filtered out of
   * the Set-Cookie header when setting this cookie.
   */
  overwrite(overwrite: boolean): this
}
