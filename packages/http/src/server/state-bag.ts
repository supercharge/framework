'use strict'

import { tap } from '@supercharge/goodies'
import { RouterContext } from '@koa/router'
import { Dict, StateBag as StateBagContract } from '@supercharge/contracts'

export class StateBag implements StateBagContract {
  /**
   * Stores the request context object.
   */
  private readonly ctx: RouterContext

  /**
   * Create a new instance.
   */
  constructor (ctx: RouterContext) {
    this.ctx = ctx
  }

  /**
   * Returns a new state bag for the given `ctx`.
   */
  static from (ctx: RouterContext): StateBag {
    return new StateBag(ctx)
  }

  /**
   * Returns the state object.
   */
  all (...keys: string[]): Dict<any> {
    if (keys.length === 0) {
      return this.ctx.state
    }

    return ([] as string[])
      .concat(...keys)
      .reduce((carry: Dict<any>, key) => {
        carry[key] = this.get(key)

        return carry
      }, {})
  }

  /**
   * Returns the saved state for the given `name`.
   */
  get<R = any> (name: string, defaultValue?: R): R {
    return this.ctx.state[name] ?? defaultValue
  }

  /**
   * Add a key-value-pair to the shared state or an object of key-value-pairs.
   */
  add (name: string | Dict<any>, value?: any): this {
    if (typeof name === 'string') {
      return tap(this, () => {
        this.ctx.state[name] = value
      })
    }

    if (this.isObject(name)) {
      return tap(this, () => {
        Object.assign(this.ctx.state, name)
      })
    }

    throw new Error(`Invalid argument when setting state via "state().set()". Expected a key-value-pair or object as the first argument. Received ${name}.`)
  }

  /**
   * Remove the shared state item for the given `name`.
   */
  remove (name: string): this {
    const { [name]: _, ...rest } = this.ctx.state

    return this.clear().add(rest)
  }

  /**
   * Removes all shared state items.
   */
  clear (): this {
    return tap(this, () => {
      this.ctx.state = {}
    })
  }

  /**
   * Determine whether a shared state item exists for the given `name`.
   */
  has (name: string): boolean {
    return !!this.get(name)
  }

  /**
   * Determine whether the shared state is missing an item for the given `name`.
   */
  isMissing (name: string): boolean {
    return !this.has(name)
  }

  /**
   * Determine whether the given `input` is an object.
   *
   * @param input
   *
   * @returns {Boolean}
   */
  private isObject (input: any): input is Record<string, any> {
    return !!input && input.constructor.name === 'Object'
  }
}