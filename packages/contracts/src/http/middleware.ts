
import { Application } from '../index.js'
import { HttpContext, NextHandler } from './context.js'

export type InlineMiddlewareHandler =
    (ctx: HttpContext, next: NextHandler) => any | Promise<any>

export type MiddlewareCtor = new (app: Application) => Middleware

export interface Middleware {
  /**
   * Handle the given HTTP `ctx`.
   */
  handle(ctx: HttpContext, next: NextHandler): Promise<any> | any
}
