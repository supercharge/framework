
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
  get<T extends any = any> (key: string, defaultValue?: T): T

  /**
   * Set a config value.
   */
  set (key: string, value: any): this

  /**
   * Determine whether the config store contains an item for the given `key`.
   */
  has (key: string): boolean

  /**
   * Determine whether the config store is missing an item for the given `key`.
   */
  isMissing (key: string): boolean

  /**
   * Ensure that the config store contains an item for the given `key`. Calls
   * the given `callback` if no config item is available for the given `key`.
   * Throws an error if the key is not available and no callback was found.
   */
  ensure (key: string, callback?: () => void): void

  /**
   * Determine whether the config store contains an item for the given `key`,
   * but the assigned value is empty. Empty values are: `null`, `undefined`,
   * empty strings, empty arrays, empty objects. 0 is not considered empty.
   */
  isEmpty (key: string): boolean

  /**
   * Determine whether the config store contains an item for the given `key`
   * and the value is not empty.
   */
  isNotEmpty (key: string): boolean

  /**
   * Ensure that the config store contains a non-empty value for the given `key`.
   * This function calls the given `callback` if the value is empty. Throws an
   * error if you don’t provide callback or the given callback doesn’t throw.
   */
  ensureNotEmpty (key: string, callback?: () => void): void
}
