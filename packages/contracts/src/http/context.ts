'use strict'

import { HttpRequest } from './request'
import { HttpResponse } from './response'
import { InteractsWithState } from './interacts-with-state'

export type NextHandler = () => any | Promise<any>

export interface HttpContext extends InteractsWithState {
  /**
   * Returns the raw Koa context.
   */
  raw: any

  /**
   * Returns the HTTP request instance.
   */
  request: HttpRequest

  /**
   * Returns the HTTP response instance.
   */
  response: HttpResponse
}
