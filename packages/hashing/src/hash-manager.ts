'use strict'

import { Manager } from '@supercharge/manager'
import { BcryptHasher } from './bcrypt-hasher'
import { Hasher } from '@supercharge/contracts'

export class HashManager extends Manager implements Hasher {
  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   *
   * @param {String} name
   */
  override driver (name?: string): Hasher {
    return super.driver(name)
  }

  /**
   * Returns the default hashing driver name.
   */
  protected defaultDriver (): string {
    return this.config().get('hashing.driver', 'bcrypt')
  }

  /**
   * Create a bcrypt hasher instance.
   */
  protected createBcryptDriver (): Hasher {
    return new BcryptHasher({
      rounds: this.config().get('hashing.bcrypt.rounds', 10)
    })
  }

  /**
   * Hash the given `value`.
   *
   * @param value
   *
   * @returns {Promise<String>}
   */
  async make (value: string): Promise<string> {
    return await this.driver().make(value)
  }

  /**
   * Compare a the `plain` text value against the given `hashedValue`.
   *
   * @param plain
   *
   * @returns {Promise<Boolean>}
   */
  async check (plain: string, hashedValue: string): Promise<boolean> {
    return await this.driver().check(plain, hashedValue)
  }

  /**
   * Determine whether the given hash value has been hashed using the configured options.
   *
   * @param {String} hashedValue
   *
   * @returns {Boolean}
   */
  needsRehash (hashedValue: string): boolean {
    return this.driver().needsRehash(hashedValue)
  }
}
