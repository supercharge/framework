
import Bcrypt from 'bcrypt'
import { BaseHasher } from './base-hasher.js'
import { Hasher as HasherContract, HashConfig } from '@supercharge/contracts'

export class BcryptHasher extends BaseHasher implements HasherContract {
  /**
   * The cost factor.
   */
  private readonly rounds: number = 12

  /**
   * Create a new instance.
   */
  constructor ({ rounds }: HashConfig['bcrypt'] = {}) {
    super()

    this.rounds = rounds ?? this.rounds
  }

  /**
   * Hash the given `value`.
   */
  async make (value: string): Promise<string> {
    return await Bcrypt.hash(value, this.rounds)
  }

  /**
   * Compare a the `plain` text value against the given `hashedValue`.
   */
  async check (plain: string, hashedValue: string): Promise<boolean> {
    return await Bcrypt.compare(plain, hashedValue)
  }

  /**
   * Determine whether the given hash value has been hashed using the configured options.
   */
  needsRehash (hashedValue: string): boolean {
    if (typeof hashedValue !== 'string') {
      throw new Error('You must provide a string value as an argument to the "needsRehash" method.')
    }

    const [version, rounds] = hashedValue.split('$').slice(1)

    return this.rounds !== Number(rounds) || version !== '2b'
  }
}
