
export interface Hasher {
  /**
   * Hash the given `value`.
   *
   * @param {String} value
   *
   * @returns {String}
   */
  make (value: string): Promise<string>

  /**
   * Compare a the `plain` text value against the given `hashedValue`.
   *
   * @param {String} value
   * @param {String} hashedValue
   *
   * @returns {Boolean}
   */
  check (plain: string, hashedValue: string): Promise<boolean>

  /**
   * Determine whether the given hash value has been hashed using the configured options.
   *
   * @param {String} hashedValue
   *
   * @returns {Boolean}
   */
  needsRehash (hashedValue: string): boolean
}
