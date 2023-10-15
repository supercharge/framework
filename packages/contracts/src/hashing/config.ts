
export interface HashConfig {
  /**
   * The hashing driver name.
   */
  driver: 'bcrypt' | 'scrypt' | string

  /**
   * The bcrypt hashing config.
   */
  bcrypt?: {
    /**
     * The number of rounds to use.
     */
    rounds?: number
  }

  /**
   * The scrypt hashing config.
   *
   * @see https://nodejs.org/docs/latest-v18.x/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback
   */
  scrypt?: {
    /**
     * The CPU/memory cost factor. Must be a power of two and greater than one. Default: 16384
     */
    cost?: number

    /**
     * The block size parameter. Default: 8
     */
    blockSize?: number

    /**
     * The salt size parameter in bytes. It’s recommended to use a salt at least 16 bytes long. Default: 16
     */
    saltSize?: number

    /**
     * The desired key length in bytes. Default: 64
     */
    keyLength?: number

    /**
     * The parallelization parameter. Default: 1
     */
    parallelization?: number

    /**
     * The memory upper bound while generating the hash. Default: 16_777_216 (128 * costs * blockSize)
     */
    maxMemory?: number
  }
}
