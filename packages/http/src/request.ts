'use strict'

import * as Koa from 'koa'
import { Files } from 'formidable'
import { FileBag } from './file-bag'
import Str from '@supercharge/strings'
import { HeaderBag } from './header-bag'
import { tap } from '@supercharge/goodies'
import { RouterContext } from 'koa__router'
import { ParameterBag } from './parameter-bag'
import { IncomingHttpHeaders, IncomingMessage } from 'http'
import { HttpRequest, InteractsWithContentTypes } from '@supercharge/contracts'

declare module 'koa' {
  interface Request extends Koa.BaseRequest {
    body?: any
    rawBody?: any
    files?: Files
  }
}

export class Request implements HttpRequest, InteractsWithContentTypes {
  /**
   * The route context object from Koa.
   */
  protected readonly ctx: Koa.Context | Koa.Context & RouterContext

  /**
   * Create a new response instance.
   *
   * @param ctx
   * @param cookieOptions
   */
  constructor (ctx: Koa.Context | Koa.Context & RouterContext) {
    this.ctx = ctx
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
  query (): ParameterBag {
    return new ParameterBag(this.ctx.query)
  }

  /**
   * Returns the request’s path parameters.
   */
  params (): ParameterBag {
    if (!this.ctx.params) {
      this.ctx.params = {}
    }

    return new ParameterBag(this.ctx.params)
  }

  /**
   * Returns the path parameter for the given `name`. Returns the
   * `defaultValue` if a parameter for the name doesn’t exist.
   */
  param<T = any> (name: string, defaultValue?: T): T {
    return this.params().get(name, defaultValue)
  }

  /**
   * Returns the request payload.
   */
  payload (): any {
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
    return !!this.header('transfer-encoding') || !isNaN(Number(this.header('content-length')))
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
   * Returns the request headers.
   */
  headers (): HeaderBag {
    return new HeaderBag(this.ctx.headers)
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
  isContentType (...types: string[]|string[][]): boolean {
    return !!this.ctx.request.is(
      ([] as string[]).concat(...types)
    )
  }
}
