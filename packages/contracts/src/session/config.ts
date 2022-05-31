'use strict'

export interface SessionConfig {
  /**
   * The session driver name.
   */
  driver: string

  /**
   * The session lifetime.
   */
  lifetime: string

  /**
   * Clear the session when the browser closes.
   */
  expireOnClose: boolean

  /**
   * Determine whether to encrypt the session data.
   */
  // encrypt:

  /**
   * Stores the session cookie options.
   */
  cookie: {
    /**
     * Stores the session cookie name.
     */
    name: string

    /**
     * Stores the session cookie path.
     */
    path: string

    /**
     * Stores the session cookie domain.
     */
    domain: string

    /**
     * Tba.
     */
    secure: boolean

    /**
     * Tba.
     */
    httpOnly: boolean

    /**
     * Tba.
     */
    sameSite: string
  }
}
