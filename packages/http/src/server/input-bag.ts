'use strict'

import { tap } from '@supercharge/goodies'
import { Dict, InputBag as InputBagContract } from '@supercharge/contracts'

export class InputBag<T> implements InputBagContract<T> {
  /**
   * Stores the request headers as an object.
   */
  protected attributes: Dict<T>

  /**
   * Create a new instance.
   */
  constructor (attributes: Dict<T>) {
    this.attributes = attributes ?? {}
  }

  /**
   * Returns an object with all `keys` existing in the input bag.
   */
  all<Key extends keyof Dict<T> = string> (...keys: Key[] | Key[][]): Dict<T> {
    if (keys.length === 0) {
      return this.attributes
    }

    return ([] as Key[])
      .concat(...keys)
      .reduce((carry: Dict<T>, key) => {
        carry[key] = this.get(key)

        return carry
      }, {})
  }

  /**
   * Returns the input value for the given `name`. Returns `undefined`
   * if the given `name` does not exist in the input bag.
   *
   * @param {Key} name
   * @param {Value} defaultValue
   *
   * @returns {Value | Dict<T>[Key] |undefined}
   */
  get<Value = any, Key extends keyof Dict<T> = string> (name: Key): Value | Dict<T>[Key] | undefined
  get<Value = any, Key extends keyof Dict<T> = string> (name: Key, defaultValue: Value): Value | Dict<T>[Key]
  get<Value = any, Key extends keyof Dict<T> = string> (name: Key, defaultValue?: Value): Value | Dict<T>[Key] | undefined {
    return this.attributes[name] ?? defaultValue
  }

  /**
   * Set an input for the given `name` and assign the `value`. This
   * overrides a possibly existing input with the same `name`.
   *
   * @param {String} name
   * @param {*} value
   *
   * @returns {this}
   */
  set (name: string, value: any): this {
    return tap(this, () => {
      this.attributes[name] = value
    })
  }

  /**
   * Removes the input with the given `name`.
   *
   * @param {String} name
   *
   * @returns {this}
   */
  remove (name: string): this {
    return tap(this, () => {
      const { [name]: _, ...rest } = this.attributes

      this.attributes = rest
    })
  }

  /**
   * Determine whether the HTTP header for the given `name` exists.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  has (name: keyof Dict<T>): boolean {
    return !!this.get(name)
  }
}
