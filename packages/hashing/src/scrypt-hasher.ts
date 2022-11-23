'use strict'

import { randomBytes, scrypt } from 'node:crypto'
import { Hasher as HasherContract, HashConfig } from '@supercharge/contracts'

type RequiredHashConfig = Required<HashConfig>

export class ScryptHasher implements HasherContract {
  /**
   * Stores the scrypt config object.
   */
  private readonly config: Required<RequiredHashConfig['scrypt']>

  /**
   * Create a new instance.
   */
  constructor (config: HashConfig['scrypt'] = {}) {
    this.config = {
      cost: 16384,
      blockSize: 8,
      saltSize: 16,
      parallelization: 1,
      maxMemory: 128 * 16384 * 8,
      keyLength: 64,
      ...config
    }

    // TODO: validate the config object
  }

  /**
   * Hash the given `value`.
   *
   * @param value
   *
   * @returns {String}
   */
  async make (value: string): Promise<string> {
    const salt = randomBytes(this.config.saltSize)

    const hash = await new Promise<string>((resolve, reject) => {
      scrypt(value, salt, this.config.keyLength, (error, hash) => {
        if (error) {
          return reject(error)
        }

        resolve(hash.toString('utf8'))
      })
    })

    // TODO: add props to hash before returning it

    return hash
  }

  /**
   * Compare a the `plain` text value against the given `hashedValue`.
   */
  async check (plain: string, hashedValue: string): Promise<boolean> {
    const hash = await this.make(plain)

    return hash === hashedValue
  }

  /**
   * Determine whether the given hash value has been hashed using the configured options.
   *
   * @param {String} hashedValue
   *
   * @returns {Boolean}
   */
  needsRehash (hashedValue: string): boolean {
    if (typeof hashedValue !== 'string') {
      throw new Error('You must provide a string value as an argument to the "needsRehash" method.')
    }

    const [version, rounds] = hashedValue.split('$').slice(1)

    return this.rounds !== Number(rounds) || version !== '2b'
  }
}
