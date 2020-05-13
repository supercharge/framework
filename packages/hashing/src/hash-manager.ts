'use strict'

import { ArgonHasher } from './argon-hasher'
import { BcryptHasher } from './bcrypt-hasher'
import { Manager } from '@supercharge/manager'
import { Hasher as HashContract } from '@supercharge/contracts'

export class HashManager extends Manager implements HashContract {
  /**
   * Hash the given `value`.
   *
   * @param {String} value
   *
   * @returns {String}
   */
  async make (value: string): Promise<string> {
    return this.driver().make(value)
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
    return this.driver().check(value, hash)
  }

  /**
   * Returns the default hashing driver name.
   *
   * @returns {String}
   */
  defaultDriver (): string {
    return this.config().get('hashing.driver', 'bcrypt')
  }

  /**
   * Create a Bcrypt hashing driver instance.
   *
   * @returns {BcryptHasher}
   */
  createBcryptDriver (): BcryptHasher {
    return new BcryptHasher(
      this.config().get('hashing.bcrypt', {})
    )
  }

  /**
   * Create an Argon hashing driver instance.
   *
   * @returns {ArgonHasher}
   */
  createArgonDriver (): ArgonHasher {
    return new ArgonHasher(
      this.config().get('hashing.argon', {})
    )
  }
}
