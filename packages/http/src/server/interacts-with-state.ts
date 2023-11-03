
import { StateBag } from './state-bag.js'
import { InputBag } from './input-bag.js'
import { tap } from '@supercharge/goodies'
import { RouterContext } from '@koa/router'
import { InteractsWithState as InteractsWithStateContract, HttpStateData } from '@supercharge/contracts'

export class InteractsWithState implements InteractsWithStateContract {
  /**
   * The route context object from Koa.
   */
  protected readonly koaCtx: RouterContext

  /**
   * Create a new instance.
   */
  constructor (ctx: RouterContext) {
    this.koaCtx = ctx
  }

  /**
   * Returns the shared state bag for this HTTP context.
   */
  state (): StateBag {
    return new InputBag(this.koaCtx.state)
  }

  /**
   * Share a given `state` across HTTP requests. Any previously
   * set state will be merged with the given `state`.
   */
  share<Key extends keyof HttpStateData> (key: Key, value: HttpStateData[Key]): this
  share (values: Partial<HttpStateData>): this
  share<Key extends keyof HttpStateData> (key: Key | HttpStateData, value?: any): this {
    return tap(this, () => {
      this.state().set(key, value)
    })
  }
}
