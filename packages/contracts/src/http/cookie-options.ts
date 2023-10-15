
export interface CookieOptions {
  /**
   * The time or date in the future at which the cookie expires.
   */
  expires?: Date

  /**
   * The number of milliseconds from `Date.now()` until the cookie expires.
   */
  maxAge?: number

  /**
   * The URL path on the server on which the cookie will be available.
   */
  path?: string

  /**
   * The domain that the cookie will be available to.
   */
  domain?: string

  /**
   * Determine whether the cookie is a 'same-site' cookie. Using `true` translates
   * to `'strict'`, using `false` will not set the `sameSite` cookie attribute.
   */
  sameSite?: 'strict' | 'lax' | 'none' | true | false

  /**
   * Determine whether the cookie is only sent over HTTP(S)
   * and not available to client-side JavaScript.
   */
  httpOnly?: boolean

  /**
   * Determine whether the cookie can only be sent over HTTP (`false`) or HTTPS (`true`).
   */
  secure?: boolean

  /**
   * Determine whether cookies will be signed using the app key.
   */
  signed?: boolean

  /**
   * Determine whether to overwrite previously set cookies with the same name.
   */
  overwrite?: boolean
}
