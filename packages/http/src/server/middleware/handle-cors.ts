'use strict'

import Koa from 'koa'
import cors from '@koa/cors'
import { Application, CorsConfig, HttpContext, Middleware, NextHandler } from '@supercharge/contracts'

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
   * @returns {CorsConfig}
   */
  protected createConfig (): cors.Options {
    const config = this.config()

    return {
      maxAge: config.maxAge,
      keepHeadersOnError: true,
      origin: config.allowedOrigin,
      allowMethods: config.allowedMethods,
      allowHeaders: config.allowedHeaders,
      exposeHeaders: config.exposedHeaders,
      credentials: config.supportsCredentials
    }
  }

  /**
   * Returns the options determining how to serve assets.
   *
   * @returns {CorsConfig}
   */
  protected config (): CorsConfig {
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
