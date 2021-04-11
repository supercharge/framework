'use strict'

import { Context } from 'koa'
import { Request } from './request'
import { Response } from './response'
import { InteractsWithState } from './interacts-with-state'
import { Application, HttpContext as HttpContextContract, CookieOptions, ViewEngine } from '@supercharge/contracts'

export class HttpContext extends InteractsWithState implements HttpContextContract {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * Create a new HTTP context instance.
   *
   * @param ctx
   */
  constructor (ctx: Context, app: Application) {
    super(ctx)

    this.app = app
  }

  /**
   * Returns a wrapped HTTP context for the raw Koa HTTP `ctx`.
   *
   * @param ctx
   *
   * @returns {HttpContext}
   */
  static wrap (ctx: any, app: Application): HttpContext {
    return new this(ctx, app)
  }

  /**
   * Returns the raw Koa HTTP context instance.
   *
   * @returns {Context}
   */
  get raw (): Context {
    return this.ctx
  }

  /**
   * Returns the HTTP request instance.
   *
   * @returns {Request}
   */
  get request (): Request {
    return new Request(this.ctx)
  }

  /**
   * Returns the HTTP response instance.
   *
   * @returns {Response}
   */
  get response (): Response {
    return new Response(
      this.ctx, this.app.make<ViewEngine>('view'), this.cookieOptions()
    )
  }

  /**
   * Returns the default cookie options.
   *
   * @returns {CookieOptions}
   */
  private cookieOptions (): CookieOptions {
    return this.app.config().get('http.cookie')
  }
}
