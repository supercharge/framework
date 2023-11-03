
import _ from 'lodash'
import { RouterContext } from '@koa/router'
import { InputBag as InputBagContract } from '@supercharge/contracts'

export class ResponseHeaderBag<ResponseHeaders> implements InputBagContract<ResponseHeaders> {
  /**
   * Stores the request headers as an object.
   */
  private readonly ctx: RouterContext

  /**
   * Create a new instance.
   */
  constructor (ctx: RouterContext) {
    this.ctx = ctx
  }

  /**
   * Returns the properties object of this input bag.
   */
  toJSON (): ResponseHeaders {
    return this.all()
  }

  /**
   * Returns all properties within this input bag or an object with all `keys` that exist in the bag.
   */
  all (): ResponseHeaders
  all <R extends Record<string, any>>(): R
  all<Key extends keyof ResponseHeaders> (...keys: Key[] | Key[][]): Partial<Record<keyof ResponseHeaders, ResponseHeaders[keyof ResponseHeaders]>>
  all<Key extends keyof ResponseHeaders> (...keys: Key[] | Key[][]): Partial<Record<keyof ResponseHeaders, ResponseHeaders[keyof ResponseHeaders]>> {
    if (keys.length === 0) {
      return this.ctx.response.headers as Partial<Record<keyof ResponseHeaders, ResponseHeaders[keyof ResponseHeaders]>>
    }

    return ([] as Key[])
      .concat(...keys)
      .reduce<Partial<ResponseHeaders>>((carry, key) => {
      carry[key] = this.get(key)

      return carry
    }, {})
  }

  /**
   * Returns the input value for the given `key`. Returns `undefined`
   * if the given `key` does not exist in the input bag.
   */
  get<Key extends keyof ResponseHeaders> (key: Key): ResponseHeaders[Key]
  get<Value = any, Key extends keyof ResponseHeaders = any> (key: Key, defaultValue: Value): ResponseHeaders[Key] | Value
  get<Value = any> (key: string, defaultValue: Value): Value | undefined
  get<Value = any, Key extends keyof ResponseHeaders = any> (key: Key, defaultValue?: Value): ResponseHeaders[Key] | Value {
    const value = this.ctx.response.get(key as string) as ResponseHeaders[Key] | Value

    if (value !== '') {
      return value
    }

    return defaultValue ?? value
  }

  /**
   * Set an input for the given `key` and assign the `value`. This
   * overrides a possibly existing input with the same `key`.
   */
  set<Key extends keyof ResponseHeaders> (key: Key, value: ResponseHeaders[Key]): this
  set (values: Partial<ResponseHeaders>): this
  set<Key extends keyof ResponseHeaders> (key: Key | Partial<ResponseHeaders>, value?: any): this
  set<Key extends keyof ResponseHeaders> (key: Key | Partial<ResponseHeaders>, value?: any): this {
    if (typeof key === 'string') {
      this.ctx.set(key, value)
      return this
    } else if (this.isObject(key)) {
      return this.merge(key)
    }

    throw new Error(`Invalid argument when setting values via ".set()". Expected a key-value-pair or object as the first argument. Received ${String(key)}.`)
  }

  /**
   * Merge the given `data` object with the existing input bag.
   */
  merge (data: Partial<ResponseHeaders>): this {
    if (this.isObject(data)) {
      return this.set(data)
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
  exists<Key extends keyof ResponseHeaders> (key: Key): boolean {
    return _.has(this.ctx.response.headers, key)
  }

  /**
   * Determine whether an item with the given `key` exists in the input bag
   * and the assigned value is not `undefined`. The assigned value could
   * also be `null`. Empty states should explcitely use `undefinied`.
   */
  has<Key extends keyof ResponseHeaders> (key: Key): boolean {
    return this.get(key) !== undefined
  }

  /**
   * Determine whether the input bag is missing a value for the given `key`.
   */
  isMissing<Key extends keyof ResponseHeaders> (key: Key): boolean {
    return !this.has(key)
  }

  /**
   * Remove the input bag item for the given `key`.
   */
  remove<Key extends keyof ResponseHeaders> (key: Key): this {
    this.ctx.remove(key as string)

    return this
  }

  /**
   * Removes all data from the input bag.
   */
  clear (): this {
    Object.keys(
      this.all() as Record<string, string | string[]>
    ).forEach(header => {
      this.ctx.remove(header)
    })

    return this
  }
}
