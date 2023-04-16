'use strict'

import { StateBag } from './state-bag'
import { tap } from '@supercharge/goodies'
import { RouterContext } from '@koa/router'
import { InteractsWithState as InteractsWithStateContract, RequestStateData } from '@supercharge/contracts'

export class InteractsWithState implements InteractsWithStateContract {
  /**
   * The route context object from Koa.
   */
  protected readonly koaCtx: RouterContext

  /**
   * Create a new instance.
   *
   * @param ctx
   */
  constructor (ctx: RouterContext) {
    this.koaCtx = ctx
  }

  /**
   * Returns the shared state bag for this HTTP context.
   *
   * @returns {StateBag}
   */
  state (): StateBag {
    return StateBag.from(this.koaCtx)
  }

  /**
   * Share a given `state` across HTTP requests. Any previously
   * set state will be merged with the given `state`.
   *
   * @returns {ThisType}
   */
  share<K extends keyof RequestStateData> (key: K, value: RequestStateData[K]): this
  share (key: string, value: any): this
  share (values: RequestStateData): this
  share<K extends keyof RequestStateData> (key: K | string | RequestStateData, value?: any): this {
    return tap(this, () => {
      this.state().add(key, value)
    })
  }
}
