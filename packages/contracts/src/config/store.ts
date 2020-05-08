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
  get (key: string, defaultValue?: any): any

  /**
   * Set a config value.
   */
  set (key: string, value: any): void

  /**
   * Determine whether the config store contains an item for the given `key`.
   */
  has (key: string): boolean
}
