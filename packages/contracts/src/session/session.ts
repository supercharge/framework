'use strict'

export interface Session {
  /**
   * Returns the session ID.
   */
  id(): string

  /**
   * Assign the given `sessionId`.
   */
  setId(sessionId: string): this

  /**
   * Returns the session name.
   */
  name(): string

  /**
   * Returns all of the session data.
   */
  all(): Record<string, any>

  /**
   * Returns the session item for the given `key`.
   */
  get<R = any | undefined> (key: string, defaultValue?: R): R

  /**
   * Put a key-value-pair or an object of key-value-pairs to the session.
   * This is an alias for the `set` method.
   */
  put(values: Record<string, any>): this
  put(key: string, value: any): this

  /**
   * Put a key-value-pair or an object of key-value-pairs to the session.
   */
  set(values: Record<string, any>): this
  set(key: string, value: any): this

  /**
   * Determine whether the session contains an entry for the given `key`.
   */
  has(key: string): boolean

  /**
   * Returns the session item for the given `key` and removes it from the session data.
   */
  pull<R = any | undefined> (key: string, defaultValue?: R): R

  /**
   * Remove one or more items from the session.
   */
  delete(...keys: string[] | string[][]): this

  /**
   * Removes all items from the session.
   */
  clear(): this

  /**
   * Push a the given `value` onto a session array stored for the given `key`.
   */
  push(key: string, value: any): this

  /**
    * Flash a key-value-pair or an object of key-value-pairs to the session.
    */
  flash(values: Record<string, any>): this
  flash(key: string, value: any): this

  /**
    * Reflash all the session’s flash data or the given `keys`.
    */
  reflash(...keys: string[] | string[][]): this

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
