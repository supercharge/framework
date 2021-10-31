'use strict'

import Koa from 'koa'
import cors from '@koa/cors'
import { Application, CorsOptions, HttpContext, Middleware, NextHandler } from '@supercharge/contracts'

export class HandleCorsMiddleware implements Middleware {
  /**
   * The application instance.
   */
  protected readonly app: Application

  /**
   * The CORS handler for incoming requests.
   */
  private readonly handleCors: Koa.Middleware

  /**
   * Create a new middleware instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.app = app
    this.handleCors = cors(this.createConfig())
  }

  /**
   * Returns the options determining how to serve assets.
   *
   * @returns {CorsOptions}
   */
  protected createConfig (): cors.Options {
    const options = this.config()

    return {
      maxAge: options.maxAge,
      keepHeadersOnError: true,
      origin: options.allowedOrigin,
      allowMethods: options.allowedMethods,
      allowHeaders: options.allowedHeaders,
      exposeHeaders: options.exposedHeaders,
      credentials: options.supportsCredentials
    }
  }

  /**
   * Returns the options determining how to serve assets.
   *
   * @returns {CorsOptions}
   */
  protected config (): CorsOptions {
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
