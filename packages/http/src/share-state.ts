'use strict'

import { Context } from 'koa'
import { tap } from '@supercharge/goodies'
import { ShareState as ShareStateContract } from '@supercharge/contracts'

export class ShareState implements ShareStateContract {
  /**
   * The route context object from Koa.
   */
  protected readonly ctx: Context

  /**
   * Create a new response instance.
   *
   * @param ctx
   * @param cookieOptions
   */
  constructor (ctx: Context) {
    this.ctx = ctx
  }

  /**
   * Returns the shared HTTP context state.
   *
   * @returns {*}
   */
  state (): any {
    return this.ctx.state
  }

  /**
   * Share a given `state` across HTTP requests. Any previously
   * set state will be merged with the given `state`.
   *
   * @returns {ThisType}
   */
  share (key: string | any, value?: any): this {
    return tap(this, () => {
      const state = this.isObject(key) ? key : { [key]: value }

      Object.assign(this.ctx.state, state)
    })
  }

  /**
   * Determine whether the given `input` is an object.
   *
   * @param input
   *
   * @returns {Boolean}
   */
  private isObject (input: any): boolean {
    return typeof input === 'object' && !Array.isArray(input) && input !== null
  }
}
