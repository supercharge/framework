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
   * Stores the session files location.
   */
  files: string

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
  /**
   * Config for the file driver
   */
  file?: {
    location: string
  }

  /**
   * The redis connection to use from the `config/redis` file
   */
  redisConnection?: string
}
