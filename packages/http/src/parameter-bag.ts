'use strict'

import { tap } from '@supercharge/goodies'
import { ParameterBag as ParameterBagContract } from '@supercharge/contracts'

export class ParameterBag implements ParameterBagContract {
  /**
   * Stores the request attributes, like query or path parameters.
   */
  private readonly attributes: Record<string, any>

  /**
   * Create a new instance.
   */
  constructor (attributes: Record<string, any> = {}) {
    this.attributes = attributes
  }

  /**
   * Returns the attributes object.
   */
  all (...keys: string[]|string[][]): Record<string, any> {
    if (keys.length === 0) {
      return this.attributes
    }

    return ([] as string[])
      .concat(...keys)
      .reduce((carry: Record<string, any>, key) => {
        carry[key] = this.get(key)

        return carry
      }, {})
  }

  /**
   * Returns the attribute value for the given `name` or the `defaultValue`.
   *
   * @param {String} name
   * @param {T} defaultValue
   *
   * @returns {T|undefined}
   */
  get<T = any> (name: string, defaultValue?: T): T {
    return this.attributes[name] ?? defaultValue
  }

  /**
   * Set an attribute for the given `name` and assign the `value`.
   * This will override an existing attribute for the given `name`.
   *
   * @param {String} name
   * @param {String|String[]} value
   *
   * @returns {HeaderBag}
   */
  set (name: string, value: string | string[]): ParameterBag {
    return tap(this, () => {
      this.attributes[name] = value
    })
  }

  /**
   * Determine whether the attribute for the given `name` exists.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  has (name: string): boolean {
    return !!this.get(name)
  }

  /**
   * Remove the attribute for the given `name`.
   *
   * @param {String} name
   *
   * @returns {ParameterBag}
   */
  remove (name: string): ParameterBag {
    return tap(this, () => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.attributes[name]
    })
  }

  /**
   * Returns an object containing all attributes.
   */
  toJSON (): Record<string, any> {
    return this.all()
  }
}
