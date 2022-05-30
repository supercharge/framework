'use strict'

export interface Session {
  /**
   * Returns the session ID.
   */
  id(): string

  /**
   * Returns all of the session data.
   */
  all(): Record<string, any>

  /**
   * Returns the session item for the given `key`.
   */
  get<R = any | undefined> (key: string, defaultValue?: R): R

  /**
   * Determine whether the session contains an entry for the given `key`.
   */
  has(key: string): boolean

  /**
   * Returns the session item for the given `key` and removes it from the session data.
   */
  pull<R = any | undefined> (key: string, defaultValue?: R): R

  /**
   * Put a key-value-pair or an object of key-value-pairs into the session.
   */
  put(key: string, value: any): this
  put(values: Record<string, any>): this

  /**
   * Remove one or more items from the session.
   */
  forget(...keys: string[] | string[][]): this

  /**
   * Removes all items from the session.
   */
  clear(): this

  /**
   * Generate a new session ID.
   */
  regenerate(): this

  /**
   * Removes all items from the session and regenerates the ID.
   */
  invalidate(): this

  /**
   * Starte the session and read the session from a storage.
   */
  start(): Promise<this>

  /**
   * Save the session data to a storage.
   */
  commit(): Promise<this>
}
