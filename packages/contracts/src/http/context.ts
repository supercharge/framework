
import { HttpRequest } from './request'
import { HttpResponse } from './response'
import { RouterContext } from '@koa/router'
import { InteractsWithState } from './concerns/interacts-with-state'

export type NextHandler = () => any | Promise<any>

export interface HttpContext extends InteractsWithState {
  /**
   * Returns the raw Koa context.
   */
  raw: RouterContext

  /**
   * Returns the HTTP request instance.
   */
  request: HttpRequest

  /**
   * Returns the HTTP response instance.
   */
  response: HttpResponse
}
