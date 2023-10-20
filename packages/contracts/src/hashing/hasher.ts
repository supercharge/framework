
export type HasherCtor = new(...args: any[]) => Hasher

export interface Hasher {
  /**
   * Hash the given `value`.
   */
  make (value: string): Promise<string>

  /**
   * Compare a the `plain` text value against the given `hashedValue`.
   */
  check (plain: string, hashedValue: string): Promise<boolean>

  /**
   * Determine whether the given hash value has been hashed using the configured options.
   */
  needsRehash (hashedValue: string): boolean
}
