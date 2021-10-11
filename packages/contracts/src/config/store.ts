'use strict'

export interface ConfigStore {
  /**
   * Returns the config store as an object.
   */
  all (): object

  /**
   * Returns the requested config value for the given `key`. You may pass in
   * a default value as the second argument. The default value will be
   * returned if the config value for `key` is not existent.
   */
  get<T = any> (key: string, defaultValue?: T): T

  /**
   * Set a config value.
   */
  set (key: string, value: any): ConfigStore

  /**
   * Determine whether the config store contains an item for the given `key`.
   */
  has (key: string): boolean

  /**
   * Ensure that the config store contains an item for the given `key`. Calls
   * the given `callback` if no config item is available for the given `key`.
   * Throws an error if the key is not available and no callback was found.
   */
  ensure (key: string, callback?: () => void): void
}
