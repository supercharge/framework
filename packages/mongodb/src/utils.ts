'use strict'

export function isObject (value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
