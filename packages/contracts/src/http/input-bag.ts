'use strict'

import { Dict } from '..'

export interface InputBag<T> {
  /**
   * Returns an object with all `keys` existing in the input bag.
   */
  all(...keys: Array<keyof Dict<T>> | Array<Array<keyof Dict<T>>>): Dict<T>

  /**
   * Returns the input value for the given `name`. Returns `undefined`
   * if the given `name` does not exist in the input bag.
   */
  get<Value = any, Header extends keyof Dict<T> = string> (name: Header, defaultValue?: Value): Value | Dict<T>[Header] | undefined

  /**
   * Set an input for the given `name` and assign the `value`. This
   * overrides a possibly existing input with the same `name`.
   */
  set (name: string, value: any): ThisType<T>

  /**
   * Removes the input with the given `name`.
   */
  remove(name: keyof Dict<T>): ThisType<T>

  /**
   * Determine whether the input for the given `name` exists.
   */
  has(name: keyof Dict<T>): boolean
}
