'use strict'

import buddy from '@supercharge/co-body'
import { Application, CorsOptions, HttpContext, Middleware, NextHandler } from '@supercharge/contracts'

export class Bodyparser implements Middleware {
  /**
   * The application instance.
   */
  protected readonly app: Application

  /**
   * Create a new middleware instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.app = app
  }

  /**
   * Returns the options determining how to serve assets.
   *
   * @returns {CorsOptions}
   */
  config (): CorsOptions {
    return this.app.config().get('cors')
  }

  /**
   * Handle the incoming request.
   *
   * @param ctx HttpContext
   * @param next NextHandler
   */
  async handle (ctx: HttpContext, next: NextHandler): Promise<void> {
    await next()
  }
}
