'use strict'

import * as Koa from 'koa'
import { Files } from 'formidable'
import { FileBag } from './file-bag'
import Str from '@supercharge/strings'
import { CookieBag } from './cookie-bag'
import { Mixin as Many } from 'ts-mixer'
import { tap } from '@supercharge/goodies'
import { RouterContext } from '@koa/router'
import { ParameterBag } from './parameter-bag'
import { Macroable } from '@supercharge/macroable'
import { RequestHeaderBag } from './request-header-bag'
import { IncomingHttpHeaders, IncomingMessage } from 'http'
import { CookieOptions, HttpRequest, InteractsWithContentTypes, RequestCookieBuilderCallback } from '@supercharge/contracts'
import { InteractsWithState } from './interacts-with-state'

declare module 'koa' {
  interface Request extends Koa.BaseRequest {
    body?: any
    rawBody?: any
    files?: Files
  }
}

export class Request extends Many(Macroable, InteractsWithState) implements HttpRequest, InteractsWithContentTypes {
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
  constructor (ctx: RouterContext, cookieOptions: CookieOptions) {
    super(ctx)

    this.cookieOptions = cookieOptions
  }

  /**
   * Returns the raw Node.js request.
   */
  req (): IncomingMessage {
    return this.ctx.req
  }

  /**
   * Returns the request method.
   */
  method (): string {
    return this.ctx.request.method
  }

  /**
   * Returns the request’s URL path.
   */
  path (): string {
    return this.ctx.request.path
  }

  /**
   * Returns the request’s query parameters.
   */
  query (): ParameterBag<string | string[]> {
    return new ParameterBag<string | string[]>(this.ctx.query)
  }

  /**
   * Returns the request’s path parameters.
   */
  params (): ParameterBag<string> {
    if (!this.ctx.params) {
      this.ctx.params = {}
    }

    return new ParameterBag(this.ctx.params)
  }

  /**
   * Returns the path parameter for the given `name`. Returns the
   * `defaultValue` if a parameter for the name doesn’t exist.
   */
  param (name: string): string | undefined
  param (name: string, defaultValue: string): string
  param (name: string, defaultValue?: string): string | undefined {
    return this.params().get(name, defaultValue)
  }

  /**
   * Returns the cookie bag.
   */
  cookies (): CookieBag {
    return new CookieBag(this.ctx.cookies, this.cookieOptions)
  }

  /**
   * Returns the cookie value for the given `name`. Supports an options
   * builder as the second argument allowing you to change whether you
   * want to retrieve the cookie `unsigned` from the incomig request.
   */
  cookie (name: string, cookieBuilder?: RequestCookieBuilderCallback): string | undefined {
    return this.cookies().get(name, cookieBuilder)
  }

  /**
   * Determine whether a cookie exists for the given `name`.
   */
  hasCookie (name: string): boolean {
    return this.cookies().has(name)
  }

  /**
   * Returns the request payload.
   */
  payload<T = any> (): T {
    return this.ctx.request.body
  }

  /**
   * Returns the merged request payload, files and query parameters. The query parameters
   * take preceedence over the request payload and files. Files take preceedence over the
   * request payload in case attributes with the same name are defined in both places.
   */
  all (): { [key: string]: any } {
    return {
      ...this.payload(),
      ...this.query().all(),
      ...this.files().all()
    }
  }

  /**
   * Returns an input item for the given `name` from the request payload or query parameters.
   * Returns the `defaultValue` if a parameter for the name doesn’t exist.
   */
  input<T = any> (name: string, defaultValue?: T): T {
    return this.all()[name] ?? defaultValue
  }

  /**
   * Determine whether a request body exists.
   */
  hasPayload (): boolean {
    return this.headers().has('transfer-encoding') || this.contentLength() > 0
  }

  /**
   * Assign the given `payload` as the request body.
   *
   * @param {*} payload
   *
   * @returns {this}
   */
  setPayload (payload: any): this {
    return tap(this, () => {
      this.ctx.request.body = payload
    })
  }

  /**
   * Returns the raw request payload
   */
  rawPayload (): any {
    return this.ctx.request.rawBody
  }

  /**
   * Store the given raw `payload` for this request.
   *
   * @param {*} payload
   *
   * @returns {this}
   */
  setRawPayload (payload: any): this {
    return tap(this, () => {
      this.ctx.request.rawBody = payload
    })
  }

  /**
   * Returns all files on the request.
   *
   * @returns {FileBag}
   */
  files (): FileBag {
    return FileBag.createFromBase(this.ctx.request.files)
  }

  /**
   * Assign the given `files` to the request.
   *
   * @param {Files} files
   *
   * @returns {this}
   */
  setFiles (files: any): this {
    return tap(this, () => {
      this.ctx.request.files = files
    })
  }

  /**
   * Returns the request header bag.
   */
  headers (): RequestHeaderBag {
    return new RequestHeaderBag(this.ctx)
  }

  /**
   * Returns the request header identified by the given `key`. The default
   * value will be returned if no header is present for the given key.
   *
   * @param {String} key
   * @param {String|String[]} defaultValue
   *
   * @returns {String}
   */
  header<Header extends keyof IncomingHttpHeaders> (key: Header, defaultValue?: any): IncomingHttpHeaders[Header] {
    return this.headers().get(key, defaultValue)
  }

  /**
   * Determine whether the request contains a header with the given `key`.
   *
   * @returns {Boolean}
   */
  hasHeader (key: string): boolean {
    return this.headers().has(key)
  }

  /**
   * Determine whether the request is sending JSON payload.
   *
   * @returns {Boolean}
   */
  isJson (): boolean {
    return Str(
      this.contentType()
    ).contains('/json', '+json')
  }

  /**
   * Determine whether the request is asking for a JSON response.
   *
   * @returns {Boolean}
   */
  wantsJson (): boolean {
    return Str(
      this.header('accept')
    ).contains('/json', '+json')
  }

  /**
   * Determine whether the request is asking for an HTML response.
   *
   * @returns {Boolean}
   */
  wantsHtml (): boolean {
    return Str(
      this.header('accept')
    ).contains('text/html')
  }

  /**
   * Returns the request’s content mime type from the `Content-Type` header field.
   *
   * @example
   * ```
   * request.contentType()
   * ```
   */
  contentType (): IncomingHttpHeaders['content-type'] {
    return this.header('content-type')
  }

  /**
   * Returns the request’s content size as a number retrieved from the `Content-Length` header field.
   *
   * @example
   * ```
   * request.contentLength()
   * ```
   */
  contentLength (): number {
    const length = this.header('content-length')

    return Number(length) || 0
  }

  /**
   * Determine whether the request contains any of the given content `types`.
   * This method compares the "Content-Type" header value with all of the
   * given `types` determining whether one of the content types matches.
   *
   * @example
   * ```
   * // Request with Content-Type: text/html; charset=utf-8
   * request.isContentType('text/html') // true
   * request.isContentType('text/html', 'application/json') // true
   * request.isContentType(['text/html', 'application/json'])  // true
   *
   * // Request with Content-Type: application/json
   * request.isContentType('json') // true
   * request.isContentType('application/*')  // true
   *
   * request.isContentType('json', 'html') // true
   * request.isContentType('html') // false
   * ```
   */
  isContentType (types: string[]): boolean
  isContentType (...types: string[]): boolean
  isContentType (...types: string[] | string[][]): boolean {
    return !!this.ctx.request.is(
      ([] as string[]).concat(...types)
    )
  }

  /**
   * Determine whether the request method is cacheable.
   * Cacheable methods are `HEAD` and `GET`.
   *
   * @see https://tools.ietf.org/html/rfc7231#section-4.2.3
   *
   * @returns {Boolean}
   */
  isMethodCacheable (): boolean {
    return ['GET', 'HEAD'].includes(this.method().toUpperCase())
  }

  /**
   * Determine whether the request method is not cacheable.
   * Not cacheable methods are `POST`, `PUT`, `DELETE`, `PATCH`, and `OPTIONS`.
   *
   * @see https://tools.ietf.org/html/rfc7231#section-4.2.3
   *
   * @returns {Boolean}
   */
  isMethodNotCacheable (): boolean {
    return !this.isMethodCacheable()
  }
}
