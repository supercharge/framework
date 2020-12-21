'use strict'

import { Context } from 'koa'
import { Request } from './request'
import { Response } from './response'
import { Application, HttpContext as HttpContextContract, CookieOptions } from '@supercharge/contracts'

export class HttpContext implements HttpContextContract {
  /**
   * The raw Koa context instance.
   */
  private readonly ctx: Context

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
    this.ctx = ctx
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
    return new Response(this.ctx, this.cookieOptions())
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