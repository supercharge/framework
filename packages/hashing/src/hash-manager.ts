'use strict'

import Config from '@supercharge/config'
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
    return Config.get('hashing.driver', 'bcrypt')
  }
}
