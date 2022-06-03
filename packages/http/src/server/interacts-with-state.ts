'use strict'

import { StateBag } from './state-bag'
import { tap } from '@supercharge/goodies'
import { RouterContext } from '@koa/router'
import { InteractsWithState as InteractsWithStateContract } from '@supercharge/contracts'

export class InteractsWithState implements InteractsWithStateContract {
  /**
   * The route context object from Koa.
   */
  protected readonly ctx: RouterContext

  /**
   * Create a new instance.
   *
   * @param ctx
   */
  constructor (ctx: RouterContext) {
    this.ctx = ctx
  }

  /**
   * Returns the shared state bag for this HTTP context.
   *
   * @returns {StateBag}
   */
  state (): StateBag {
    return StateBag.from(this.ctx)
  }

  /**
   * Share a given `state` across HTTP requests. Any previously
   * set state will be merged with the given `state`.
   *
   * @returns {ThisType}
   */
  share (key: string | Record<string, any>, value?: any): this {
    return tap(this, () => {
      this.state().add(key, value)
    })
  }
}
