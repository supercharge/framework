
import { HttpRequest } from './request.js'
import { HttpResponse } from './response.js'
import { RouterContext } from '@koa/router'
import { InteractsWithState } from './concerns/interacts-with-state.js'

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
