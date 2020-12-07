'use strict'

import { HttpRequest } from './request'
import { HttpResponse } from './response'

export type NextHandler = () => any | Promise<any>

export interface HttpContext {
  /**
   * Returns the raw Koa context.
   */
  raw: any

  /**
   * Returns the request instance.
   */
  request: HttpRequest

  /**
   * Returns the response instance.
   */
  response: HttpResponse
}
