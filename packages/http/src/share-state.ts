'use strict'

import { Context } from 'koa'
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
  share (state: any): this {
    typeof state === 'object'
      ? Object.assign(this.ctx.state, state)
      : this.ctx.state = state

    return this
  }
}
