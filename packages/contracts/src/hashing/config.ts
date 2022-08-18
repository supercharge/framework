'use strict'

export interface HashConfig {
  /**
   * The hashing driver name.
   */
  driver: string

  /**
   * The bcrypt hashing config.
   */
  bcrypt?: {
    /**
     * The number of rounds to use.
     */
    rounds: number
  }
}
