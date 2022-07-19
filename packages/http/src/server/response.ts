'use strict'

import { CookieBag } from './cookie-bag'
import { tap } from '@supercharge/goodies'
import { HttpRedirect } from './http-redirect'
import { ResponseHeaderBag } from './response-header-bag'
import { ViewConfigBuilder } from './view-config-builder'
import { InteractsWithState } from './interacts-with-state'
import { CookieOptions, HttpContext, HttpResponse, ViewEngine, ViewBuilderCallback, ResponseCookieBuilderCallback } from '@supercharge/contracts'

export class Response extends InteractsWithState implements HttpResponse {
  /**
   * Stores the internal properties.
   */
  private readonly meta: {
    /**
     * Stores the HTTP context.
     */
    ctx: HttpContext
  }

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
  constructor (ctx: HttpContext, viewEngine: ViewEngine, cookieOptions: CookieOptions) {
    super(ctx.raw)

    this.meta = { ctx }
    this.viewEngine = viewEngine
    this.cookieOptions = cookieOptions
  }

  /**
   * Returns the HTTP context instance
   */
  ctx (): HttpContext {
    return this.meta.ctx
  }

  /**
   * Set the response payload.
   *
   * @returns {Response}
   */
  payload (payload: any): this {
    return tap(this, () => {
      this.koaCtx.response.body = payload
    })
  }

  /**
   * Returns the response header bag.
   *
   * @returns {HeaderBag}
   */
  headers (): ResponseHeaderBag {
    return new ResponseHeaderBag(this.koaCtx)
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
      this.koaCtx.response.append(key, value)
    })
  }

  /**
   * Remove the header field for the given `name` from the response.
   *
   * @param {String} name
   *
   * @returns {Response}
   */
  removeHeader (name: string): this {
    return tap(this, () => {
      this.headers().remove(name)
    })
  }

  /**
   * Returns the cookie bag.
   */
  cookies (): CookieBag {
    return new CookieBag(this.koaCtx.cookies, this.cookieOptions)
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
      this.cookies().set(name, value, cookieBuilder)
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
      this.koaCtx.response.status = code
    })
  }

  /**
   * Returns the response status code.
   *
   * @returns {Number}
   */
  getStatus (): number {
    return this.koaCtx.response.status
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
      this.koaCtx.response.type = contentType
    })
  }

  /**
   * Set the response ETag. This will normalize quotes if necessary.
   *
   * @returns {Response}
   */
  etag (etag: string): this {
    return tap(this, () => {
      this.koaCtx.response.etag = etag
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
  redirect (url: string): HttpRedirect
  redirect (url?: string): HttpRedirect {
    return url
      ? new HttpRedirect(this.koaCtx).to(url)
      : new HttpRedirect(this.koaCtx)
  }

  /**
   * Permanently redirect the request using HTTP status code 301.
   *
   * @param {String} url
   *
   * @returns {HttpRedirect}
   */
  permanentRedirect (): HttpRedirect
  permanentRedirect (url: string): HttpRedirect
  permanentRedirect (url?: any): HttpRedirect {
    return this.redirect(url).permanent()
  }

  /**
   * Determine whether the response is an HTTP redirect using one of the status
   * codes in range 300 to 399. You may also determine whether the response is
   * a redirect using a `statusCode` value that you provide as an argument.
   */
  isRedirect (statusCode?: number): boolean {
    const responseStatusCode = this.ctx().raw.response.status as number

    return statusCode
      ? statusCode === responseStatusCode
      : responseStatusCode >= 300 && responseStatusCode <= 399
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
  async view (template: string, viewBuilder?: ViewBuilderCallback): Promise<this>
  async view (template: string, data?: any, viewBuilder?: ViewBuilderCallback): Promise<this> {
    if (typeof data === 'function') {
      viewBuilder = data
      data = {}
    }

    return this.payload(
      await this.renderView(template, data, viewBuilder)
    )
  }

  /**
   * Assigns the rendered HTML of the given `template` as the response payload.
   *
   * @param {String} template
   * @param {*} data
   * @param {Function} viewBuilder
   *
   * @returns {String}
   */
  private async renderView (template: string, data?: any, viewBuilder?: ViewBuilderCallback): Promise<string> {
    const viewData = { ...this.state().all(), ...data }
    const viewConfig = {}

    if (typeof viewBuilder === 'function') {
      viewBuilder(
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
  throw (...properties: any[]): void {
    this.koaCtx.throw(...properties)
  }
}
