'use strict'

import Argon from 'argon2'
import { Hasher as HashContract } from '@supercharge/contracts/src'

export class ArgonHasher implements HashContract {
  /**
   * The argon memory factor.
   */
  private readonly _memory: number = 1024

  /**
   * The argon threads factor.
   */
  private readonly _threads: number = 2

  /**
   * The argon time factor.
   */
  private readonly _time: number = 2

  /**
   * The argon hashing algorithm.
   */
  private readonly _algorithm: string = 'argon2i'

  /**
   * Create a new Argon hasher instance.
   *
   * @param {Object} options
   */
  constructor (options: any) {
    this._algorithm = options.type || this._algorithm
    this._threads = options.threads || this._threads
    this._memory = options.memory || this._memory
    this._time = options.time || this._time
  }

  /**
   * Hash the given `value`.
   *
   * @param {String} value
   *
   * @returns {String}
   */
  async make (value: string): Promise<string> {
    return Argon.hash(value, {
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
    return Argon.verify(hash, value)
  }

  /**
   * Returns the argon algorithm type.
   *
   * @returns {Number}
   */
  algorithm (): 0 | 1 | 2 {
    if (this._algorithm === 'argon2d') {
      return Argon.argon2d
    }

    if (this._algorithm === 'argon2id') {
      return Argon.argon2id
    }

    return Argon.argon2i
  }

  /**
   * Returns the number of threads used to create a hash.
   *
   * @returns {Number}
   */
  threads (): number {
    return this._threads
  }

  /**
   * Returns the amount of memory used to create a hash.
   *
   * @returns {Number}
   */
  memory (): number {
    return this._memory
  }

  /**
   * Returns the time cost value used to create a hash.
   *
   * @returns {Number}
   */
  time (): number {
    return this._time
  }
}
