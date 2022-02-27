'use strict'

/**
 * Determine whether the given `value` is an object.
 *
 * @param value
 *
 * @returns {Boolean}
 */
export function isObject (value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
