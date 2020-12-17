'use strict'

export interface CookieOptions {
  /**
   * The time-to-live (TTL) in milliseconds.
   */
  maxAge: number

  /**
   * The cookie URL path.
   */
  path: string

  /**
   * Determine whether the cookie is a 'same-site' cookie.
   * Using `true` maps to `'strict'`.
   */
  sameSite: 'strict' | 'lax' | 'none' | true | false

  /**
   * Determine whether the cookie is only sent over HTTP(S)
   * and not available to client-side JavaScript.
   */
  httpOnly: boolean

  /**
   * Determine whether the cookie can only be sent
   * over HTTP (`false`) or HTTPS (`true`).
   */
  secure: boolean
}
