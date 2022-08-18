'use strict'

export interface HashConfig {
  /**
   * The hashing driver name.
   */
  driver: string

  /**
   * The bcrypt hashing config.
   */
  bcrypt: {
    rounds: number
  }
}
