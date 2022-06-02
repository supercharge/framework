'use strict'

export interface SessionConfig {
  /**
   * The session driver name.
   */
  driver: string

  /**
   * Stores the session cookie name.
   */
  name: string

  /**
   * The session lifetime in seconds or in a human readable format ('2h').
   */
  lifetime: string | number

  /**
   * Clear the session when the browser closes.
   */
  expireOnClose?: boolean

  /**
   * Determine whether to encrypt the session data.
   */
  // encrypt:

  /**
   * Stores the session cookie options.
   */
  cookie: {
    /**
     * Stores the session cookie path.
     */
    path?: string

    /**
     * The domain that the cookie will be available to.
     */
    domain?: string

    /**
     * Determine whether the session cookie is only to be sent over HTTPS.
     */
    secure?: boolean

    /**
     * Determine whether the session cookie is only available through the HTTP
     * protocol and not from JavaScript.
     */
    httpOnly?: boolean

    /**
     * Determine whether the session cookie is sent along with cross-site requests.
     */
    sameSite?: 'strict' | 'lax' | 'none' | true | false
  }
}
