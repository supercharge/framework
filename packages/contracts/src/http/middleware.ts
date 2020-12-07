'use strict'

import { HttpContext, NextHandler } from './context'

export type MiddlewareCtor = new () => Middleware

export interface Middleware {
  /**
   * Handle the given request.
   */
  handle(ctx: HttpContext, next: NextHandler): unknown | Promise<unknown>
}
