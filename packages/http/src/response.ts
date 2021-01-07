'use strict'

import { Context } from 'koa'
import { tap } from '@supercharge/goodies'
import { ShareState } from './share-state'
import { HttpRedirect } from './http-redirect'
import { Application, CookieOptions, HttpResponse, ViewEngine } from '@supercharge/contracts'

export class Response extends ShareState implements HttpResponse {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * The cookie options.
   */
  private readonly cookieOptions: CookieOptions

  /**
   * Create a new response instance.
   *
   * @param ctx
   * @param cookieOptions
   */
  constructor (ctx: Context, app: Application, cookieOptions: CookieOptions) {
    super(ctx)

    this.app = app
    this.cookieOptions = cookieOptions
  }

  /**
   * Set the response payload.
   *
   * @returns {Response}
   */
  payload (payload: any): this {
    return tap(this, () => {
      this.ctx.response.body = payload
    })
  }

  /**
   * Returns the response headers.
   *
   * @returns {Object}
   */
  headers (): { [key: string]: unknown } {
    return this.ctx.response.headers
  }

  /**
   * Set a response header.
   *
   * @returns {Response}
   */
  header (key: string, value: any): this {
    return tap(this, () => {
      this.ctx.response.set(key, value)
    })
  }

  /**
   * Assign the object’s key-value pairs as response headers.
   *
   * @returns {Response}
   */
  withHeaders (headers: { [key: string]: any }): this {
    Object.entries(headers).forEach(([key, value]) => {
      this.header(key, value)
    })

    return this
  }

  /**
   * Append a header to the response. If you want to replance a possibly
   * existing response header, use the `response.header()` method.
   *
   * @returns {Response}
   */
  appendHeader (key: string, value: any): this {
    return tap(this, () => {
      this.ctx.response.append(key, value)
    })
  }

  /**
   * Remove a header field from the response.
   *
   * @returns {Response}
   */
  removeHeader (key: string): this {
    return tap(this, () => {
      this.ctx.response.remove(key)
    })
  }

  /**
   * Assign the given cookie to the response.
   *
   * @example
   * ```
   * response.cookie('name', 'value', options)
   * ```
   */
  cookie (key: string, value: any, options?: CookieOptions): this {
    return tap(this, () => {
      this.ctx.cookies.set(key, value, this.mergedCookieOptions(options))
    })
  }

  /**
   * Returns the merged cookie options from the default config and the given `options`.
   *
   * @param options
   *
   * @returns {CookieOptions}
   */
  private mergedCookieOptions (options?: CookieOptions): CookieOptions {
    return Object.assign({}, this.cookieOptions, options)
  }

  /**
   * Set a response status.
   *
   * @returns {Response}
   */
  status (status: number): this {
    return tap(this, () => {
      this.ctx.response.status = status
    })
  }

  /**
   * Set the response `Content-Type` header. This will look up the mime type
   * and set the related value as the content type header field. It also
   * removes the content type header if no valid mime type is available.
   *
   * @returns {Response}
   */
  type (contentType: string): this {
    return tap(this, () => {
      this.ctx.response.type = contentType
    })
  }

  /**
   * Set the response ETag. This will normalize quotes if necessary.
   *
   * @returns {Response}
   */
  etag (etag: string): this {
    return tap(this, () => {
      this.ctx.response.etag = etag
    })
  }

  /**
   * Temporarily redirect the request using HTTP status code 302. You can customize
   * the redirect when omitting any parameter to this `response.redirect()` method.
   *
   * @param {String} url
   *
   * @returns {HttpRedirect}
   */
  redirect (): HttpRedirect
  redirect (url: string): void
  redirect (url?: string): void | HttpRedirect {
    return url
      ? new HttpRedirect(this.ctx).to(url)
      : new HttpRedirect(this.ctx)
  }

  /**
   * Permanently redirect the request using HTTP status code 301.
   *
   * @param {String} url
   *
   * @returns {HttpRedirect}
   */
  permanentRedirect (): HttpRedirect
  permanentRedirect (url: string): void
  permanentRedirect (url?: any): any {
    return this.status(301).redirect(url)
  }

  /**
   * Render a view template as the response.
   *
   * @param {String} template
   * @param {*} data
   *
   * @returns {String}
   */
  async view (template: string, data?: any): Promise<this> {
    this.payload(
      await this.app.make<ViewEngine>('supercharge/view').render(template, data)
    )

    return this
  }
}
