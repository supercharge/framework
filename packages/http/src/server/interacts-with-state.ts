'use strict'

import { tap } from '@supercharge/goodies'
import { RouterContext } from '@koa/router'
import { InteractsWithState as InteractsWithStateContract } from '@supercharge/contracts'

export class InteractsWithState implements InteractsWithStateContract {
  /**
   * The route context object from Koa.
   */
  protected readonly ctx: RouterContext

  /**
   * Create a new response instance.
   *
   * @param ctx
   * @param cookieOptions
   */
  constructor (ctx: RouterContext) {
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
  private isObject (input: any): input is Record<string, any> {
    return !!input && input.constructor.name === 'Object'
  }
}
