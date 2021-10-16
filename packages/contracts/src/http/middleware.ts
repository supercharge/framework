'use strict'

import { Application } from '../core'
import { HttpContext, NextHandler } from './context'

export type MiddlewareCtor = new (app: Application) => Middleware

export interface Middleware {
  /**
   * Handle the given request.
   */
  handle(ctx: HttpContext, next: NextHandler): unknown | Promise<unknown>
}
