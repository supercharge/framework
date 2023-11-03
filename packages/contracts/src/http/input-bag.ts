
export interface InputBag<Properties = Record<string, any>> {
  /**
   * Returns the properties object of this input bag.
   */
  toJSON (): Properties

  /**
   * Returns an object with all `keys` existing in the input bag.
   */
  all (): Properties
  all <R extends Record<string, any>>(): R
  all<Key extends keyof Properties> (...keys: Key[] | Key[][]): Partial<Record<keyof Properties, Properties[keyof Properties]>>

  /**
   * Returns the input value for the given `name`. This method returns
   * `undefined` if the input bag doesn’t contain the given `name`.
   */
  get<Key extends keyof Properties> (name: Key): Properties[Key]
  get<Value = any, Key extends keyof Properties = any> (name: Key, defaultValue: Value): Properties[Key] | Value

  /**
   * Set an input for the given `name` and assign the `value`. This
   * overrides a possibly existing input with the same `name`.
   */
  set<Key extends keyof Properties> (name: Key, value: Properties[Key]): this
  set (values: Partial<Properties>): this

  /**
   * Merge the given `data` object with the existing input bag.
   */
  merge (data: Partial<Properties>): this

  /**
   * Determine whether the input bag contains an item for the given `key`,
   * independently from the key’s assigned value. If you need to ensure
   * that a value is not `undefined`, use the related `has` method.
   */
  exists<Key extends keyof Properties> (key: Key): boolean

  /**
   * Determine whether an item with the given `key` exists in the input bag
   * and the assigned value is not `undefined`. The assigned value could
   * also be `null`. Empty states should explcitely use `undefinied`.
   */
  has<Key extends keyof Properties> (key: Key): boolean

  /**
   * Determine whether the input bag is missing a value for the given `key`.
   */
  isMissing<Key extends keyof Properties> (key: Key): boolean

  /**
   * Remove the input bag item for the given `key`.
   */
  remove<Key extends keyof Properties> (key: Key): this

  /**
   * Removes all data from the input bag.
   */
  clear(): this
}
