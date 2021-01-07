'use strict'

import cors from '@koa/cors'
import { Application, CorsOptions, HttpContext, Middleware, NextHandler } from '@supercharge/contracts'

export class HandleCors implements Middleware {
  /**
   * The application instance.
   */
  protected readonly app: Application

  /**
   * The CORS handler for incoming requests.
   */
  private readonly handleCors: any

  /**
   * Create a new middleware instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.app = app
    this.handleCors = cors(this.config())
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
    return await this.handleCors(ctx.raw, next)
  }
}
