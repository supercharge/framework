'use strict'

import { Application, HttpContext, Middleware as MiddlewareContract, NextHandler } from '@supercharge/contracts'

export abstract class Middleware implements MiddlewareContract {
  /**
   * Stores the app instance.
   */
  protected readonly app: Application

  /**
   * Create a new middleware instance.
   */
  constructor (app: Application) {
    this.app = app
  }

  /**
   * Run the middleware processing on the given HTTP `ctx`.
   */
  abstract handle (ctx: HttpContext, next: NextHandler): Promise<any> | any
}
