'use strict'

import { Dict } from '..'
import { InputBag } from './input-bag'

export interface ParameterBag<T> extends InputBag<T> {
  /**
   * Returns the parameter value for the given `name`. This method returns
   * `undefined` if the input bag doesn’t contain the given `name`.
   */
  get<Value = string, Parameter extends keyof Dict<T> = string> (name: Parameter, defaultValue?: Value): Value | Dict<T>[Parameter] | undefined
}
