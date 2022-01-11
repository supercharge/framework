'use strict'

import { Dict } from '..'
import { InputBag } from './input-bag'

export interface ParameterBag<T> extends InputBag<T> {
  /**
   * Returns the parameter value for the given `name`. This method returns
   * `undefined` if the input bag doesn’t contain the given `name`.
   */
  get<Value = string, Header extends keyof Dict<T> = string> (name: Header, defaultValue?: Value): Value | Dict<T>[Header] | undefined
}
