'use strict'

import Argon from 'argon2'
import { Hasher } from '@supercharge/contracts'

export class ArgonHasher implements Hasher {
  /**
   * The argon hashing configuration.
   */
  private readonly config: {
    /**
     * The argon memory factor.
     */
    memory: number

    /**
     * The argon threads factor.
     */
    threads: number

    /**
     * The argon time factor.
     */
    time: number

    /**
     * The argon hashing algorithm.
     */
    algorithm: string
  }

  /**
   * Create a new Argon hasher instance.
   *
   * @param {Object} options
   */
  constructor (options: any) {
    this.config = Object.assign({
      time: 2,
      threads: 2,
      memory: 1024,
      algorithm: 'argon2i'
    }, options)
  }

  /**
   * Hash the given `value`.
   *
   * @param {String} value
   *
   * @returns {String}
   */
  async make (value: string): Promise<string> {
    return await Argon.hash(value, {
      type: this.algorithm(),
      timeCost: this.time(),
      memoryCost: this.memory(),
      parallelism: this.threads()
    })
  }

  /**
   * Compare a the plain-text `value` against the given `hash`.
   *
   * @param {String} value
   * @param {String} hash
   *
   * @returns {Boolean}
   */
  async check (value: string, hash: string): Promise<boolean> {
    return await Argon.verify(hash, value)
  }

  /**
   * Returns the argon algorithm type.
   *
   * @returns {Number}
   */
  algorithm (): 0 | 1 | 2 {
    switch (this.config.algorithm) {
      case 'argon2d':
        return Argon.argon2d

      case 'argon2id':
        return Argon.argon2id

      default:
        return Argon.argon2i
    }
  }

  /**
   * Returns the number of threads used to create a hash.
   *
   * @returns {Number}
   */
  threads (): number {
    return this.config.threads
  }

  /**
   * Returns the amount of memory used to create a hash.
   *
   * @returns {Number}
   */
  memory (): number {
    return this.config.memory
  }

  /**
   * Returns the time cost value used to create a hash.
   *
   * @returns {Number}
   */
  time (): number {
    return this.config.time
  }
}
