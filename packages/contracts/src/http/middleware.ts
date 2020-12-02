'use strict'

import { HttpContext } from './context'

export interface Middleware {
  /**
   * Handle the given request.
   */
  handle(ctx: HttpContext, next: () => Promise<any>): unknown | Promise<unknown>
}
