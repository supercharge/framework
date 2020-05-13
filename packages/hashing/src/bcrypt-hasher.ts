'use strict'

import Bcrypt from 'bcryptjs'
import { Hasher as HashContract } from '@supercharge/contracts'

export class BcryptHasher implements HashContract {
  /**
   * The default number of rounds to generate a salt.
   */
  private readonly rounds: number = 12

  /**
   * Create a new Bcrypt hasher instance.
   */
  constructor (options: any) {
    this.rounds = options.rounds || this.rounds
  }

  /**
   * Hash the given `value`.
   *
   * @param {String} value
   *
   * @returns {String}
   */
  async make (value: string): Promise<string> {
    return Bcrypt.hash(value, this.rounds)
  }

  /**
   * Compare a the plain-text `value` against an
   * existing hash.
   *
   * @param {String} value
   * @param {String} hash
   *
   * @returns {Boolean}
   */
  async check (value: string, hash: string): Promise<boolean> {
    return Bcrypt.compare(value, hash)
  }
}
