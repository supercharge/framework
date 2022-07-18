'use strict'

import { Hasher as HasherContract } from '@supercharge/contracts'

export interface BcryptOptions {
  rounds: number
}

export class BcryptHasher implements HasherContract {
  /**
   * The cost factor.
   */
  private readonly rounds: number = 10

  /**
   * Create a new instance.
   */
  constructor ({ rounds }: BcryptOptions) {
    this.rounds = rounds ?? this.rounds
  }

  /**
   * Hash the given `value`.
   *
   * @param value
   *
   * @returns {String}
   */
  async make (value: string): Promise<string> {
    //

    return value
  }

  /**
   * Compare a the `plain` text value against the given `hashedValue`.
   *
   * @param plain
   *
   * @returns {Boolean}
   */
  async check (plain: string, hashedValue: string): Promise<boolean> {
    // TODO

    return plain === hashedValue
  }
}
