'use strict'

import { CookieBag } from './cookie-bag'
import { tap } from '@supercharge/goodies'
import { RouterContext } from '@koa/router'
import { HttpRedirect } from './http-redirect'
import { ResponseHeaderBag } from './response-header-bag'
import { ViewConfigBuilder } from './view-config-builder'
import { InteractsWithState } from './interacts-with-state'
import { CookieOptions, HttpResponse, ViewEngine, ViewConfigBuilder as ViewConfigBuilderContract, ResponseCookieBuilderCallback } from '@supercharge/contracts'

export class Response extends InteractsWithState implements HttpResponse {
  /**
   * The application instance.
   */
  private readonly viewEngine: ViewEngine

  /**
   * The default cookie options.
   */
  private readonly cookieOptions: CookieOptions

  /**
   * Create a new response instance.
   *
   * @param ctx
   * @param cookieOptions
   */
  constructor (ctx: RouterContext, viewEngine: ViewEngine, cookieOptions: CookieOptions) {
    super(ctx)

    this.viewEngine = viewEngine
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
   * Returns the response header bag.
   *
   * @returns {HeaderBag}
   */
  headers (): ResponseHeaderBag {
    return new ResponseHeaderBag(this.ctx)
  }

  /**
   * Set a response header with the given `name` and `value`.
   *
   * @returns {this}
   */
  header (name: string, value: string | string[] | number): this {
    return tap(this, () => {
      return this.headers().set(name, value)
    })
  }

  /**
   * Assign the object’s key-value pairs as response headers.
   *
   * @returns {Response}
   */
  withHeaders (headers: { [key: string]: string | string[] | number }): this {
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
  appendHeader (key: string, value: string | string[]): this {
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
  cookie (name: string, value?: string | null, cookieBuilder?: ResponseCookieBuilderCallback): this {
    return tap(this, () => {
      new CookieBag(this.ctx.cookies, this.cookieOptions).set(name, value, cookieBuilder)
    })
  }

  /**
   * Set a response status code to the given `code`.
   *
   * @param {Number} code
   *
   * @returns {Response}
   */
  status (code: number): this {
    return tap(this, () => {
      this.ctx.response.status = code
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
   * @param {Function} callback
   *
   * @returns {String}
   */
  async view (template: string, callback?: (viewBuilder: ViewConfigBuilderContract) => unknown): Promise<this>
  async view (template: string, data?: any, callback?: (viewBuilder: ViewConfigBuilderContract) => unknown): Promise<this> {
    if (typeof data === 'function') {
      callback = data
      data = {}
    }

    return this.payload(
      await this.renderView(template, data, callback)
    )
  }

  /**
   * Assigns the rendered HTML of the given `template` as the response payload.
   *
   * @param {String} template
   * @param {*} data
   * @param {Function} callback
   *
   * @returns {String}
   */
  private async renderView (template: string, data?: any, callback?: (viewBuilder: ViewConfigBuilderContract) => unknown): Promise<string> {
    const viewData = { ...this.state(), ...data }
    const viewConfig = {}

    if (typeof callback === 'function') {
      callback(
        new ViewConfigBuilder(viewConfig)
      )
    }

    return await this.viewEngine.render(template, viewData, viewConfig)
  }

  /**
   * Abort the request and throw an error with the given `status`. The status defaults
   * to 500. You may pass an error message or error instance as the second argument.
   * Use the third, optional argument for properties in the error response.
   *
   * @returns {Response}
   */
  throw (status: number, message?: string | Error, properties?: {}): void
  throw (status: number | string | Error): void
  throw (status: number): void
  throw (...properties: any[]): void {
    this.ctx.throw(...properties)
  }
}
