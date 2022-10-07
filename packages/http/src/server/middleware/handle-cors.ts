'use strict'

import Koa from 'koa'
import cors from '@koa/cors'
import { CorsConfig, HttpContext, Middleware, NextHandler } from '@supercharge/contracts'

export class HandleCorsMiddleware implements Middleware {
  /**
   * The application instance.
   */
  protected readonly config: CorsConfig

  /**
   * The CORS handler for incoming requests.
   */
  private readonly handleCors: Koa.Middleware

  /**
   * Create a new middleware instance.
   *
   * @param {Application} app
   */
  constructor (config: CorsConfig) {
    this.config = config
    this.handleCors = cors(this.createConfig())
  }

  /**
   * Returns the options determining how to serve assets.
   *
   * @returns {CorsConfig}
   */
  protected createConfig (): cors.Options {
    return {
      maxAge: this.config.maxAge,
      keepHeadersOnError: true,
      origin: this.config.allowedOrigin,
      allowMethods: this.config.allowedMethods,
      allowHeaders: this.config.allowedHeaders,
      exposeHeaders: this.config.exposedHeaders,
      credentials: this.config.supportsCredentials
    }
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
