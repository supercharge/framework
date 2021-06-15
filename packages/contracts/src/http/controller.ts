'use strict'

import { HttpContext } from './context'

export interface HttpController {
  /**
   * Handle the incoming HTTP request using the given `ctx`.
   */
  handle(ctx: HttpContext): any | Promise<any>
}
