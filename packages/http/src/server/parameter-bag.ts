'use strict'

import { InputBag } from './input-bag'
import { Dict, ParameterBag as ParameterBagContract } from '@supercharge/contracts'

export class ParameterBag<T> extends InputBag<T> implements ParameterBagContract<T> {
  /**
   * Returns an object containing all parameters.
   */
  toJSON (): Dict<T> {
    return this.all()
  }
}
