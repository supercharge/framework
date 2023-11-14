
import _ from 'lodash'
import { InputBag as InputBagContract } from '@supercharge/contracts'

export class InputBag<Properties> implements InputBagContract<Properties> {
  /**
   * Stores the attributes of this input bag.
   */
  protected properties: Record<keyof Properties, Properties[keyof Properties]>

  /**
   * Create a new instance.
   */
  constructor (attributes: Properties) {
    this.properties = attributes
  }

  /**
   * Returns the properties object of this input bag.
   */
  toJSON (): Properties {
    return this.all()
  }

  /**
   * Returns all properties within this input bag or an object with all `keys` that exist in the bag.
   */
  all (): Properties
  all <R extends Record<string, any>>(): R
  all<Key extends keyof Properties> (...keys: Key[] | Key[][]): Partial<Record<keyof Properties, Properties[keyof Properties]>>
  all<Key extends keyof Properties> (...keys: Key[] | Key[][]): Partial<Record<keyof Properties, Properties[keyof Properties]>> {
    if (keys.length === 0) {
      return this.properties
    }

    return ([] as Key[])
      .concat(...keys)
      .reduce<Partial<Properties>>((carry, key) => {
      carry[key] = this.get(key)

      return carry
    }, {})
  }

  /**
   * Returns the input value for the given `key`. Returns `undefined`
   * if the given `key` does not exist in the input bag.
   */
  get<Key extends keyof Properties> (key: Key): Properties[Key]
  get<Key extends keyof Properties> (key: Key, defaultValue: Properties[Key]): NonNullable<Properties[Key]>
  get<Value = any> (key: string, defaultValue: Value): Value | undefined
  get<Value = any, Key extends keyof Properties = any> (key: Key, defaultValue?: Value): Properties[Key] | Value {
    const value = _.get(this.properties, key) as Properties[Key]

    return defaultValue !== undefined
      ? value ?? defaultValue
      : value
  }

  /**
   * Set an input for the given `key` and assign the `value`. This
   * overrides a possibly existing input with the same `key`.
   */
  set<Key extends keyof Properties> (key: Key, value: Properties[Key]): this
  set (values: Partial<Properties>): this
  set<Key extends keyof Properties> (key: Key | Partial<Properties>, value?: any): this
  set<Key extends keyof Properties> (key: Key | Partial<Properties>, value?: any): this {
    if (typeof key === 'string') {
      _.set(this.properties, key, value)

      return this
    }

    if (this.isObject(key)) {
      return this.merge(key)
    }

    throw new Error(`Invalid argument when setting values via ".set()". Expected a key-value-pair or object as the first argument. Received ${String(key)}.`)
  }

  /**
   * Merge the given `data` object with the existing input bag.
   */
  merge (data: Partial<Properties>): this {
    if (this.isObject(data)) {
      _.merge(this.properties, data)

      return this
    }

    throw new Error(`Invalid argument when merging values via ".merge()". Expected an object. Received "${typeof data}".`)
  }

  /**
   * Determine whether the given `input` is an object.
   */
  protected isObject (input: any): input is Record<string, any> {
    return !!input && input.constructor.name === 'Object'
  }

  /**
   * Determine whether the input bag contains an item for the given `key`,
   * independently from the key’s assigned value. If you need to ensure
   * that a value is not `undefined`, use the related `has` method.
   */
  exists<Key extends keyof Properties> (key: Key): boolean {
    return _.has(this.properties, key)
  }

  /**
   * Determine whether an item with the given `key` exists in the input bag
   * and the assigned value is not `undefined`. The assigned value could
   * also be `null`. Empty states should explcitely use `undefinied`.
   */
  has<Key extends keyof Properties> (key: Key): boolean {
    return this.get(key) !== undefined
  }

  /**
   * Determine whether the input bag is missing a value for the given `key`.
   */
  isMissing<Key extends keyof Properties> (key: Key): boolean {
    return !this.has(key)
  }

  /**
   * Remove the input bag item for the given `key`.
   */
  remove<Key extends keyof Properties> (key: Key): this {
    _.unset(this.properties, key)

    return this
  }

  /**
   * Removes all data from the input bag.
   */
  clear (): this {
    this.properties = {} as any

    return this
  }
}
