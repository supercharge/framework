
import * as Koa from 'koa'
import { Files } from 'formidable'
import { FileBag } from './file-bag.js'
import { Mixin as Many } from 'ts-mixer'
import { InputBag } from './input-bag.js'
import { Arr } from '@supercharge/arrays'
import { Str } from '@supercharge/strings'
import { tap } from '@supercharge/goodies'
import { CookieBag } from './cookie-bag.js'
import { IncomingMessage } from 'node:http'
import { IncomingHttpHeaders } from 'node:http2'
import { ParsedUrlQuery } from 'node:querystring'
import { Macroable } from '@supercharge/macroable'
import { RequestHeaderBag } from './request-header-bag.js'
import { QueryParameterBag } from './query-parameter-bag.js'
import { InteractsWithState } from './interacts-with-state.js'
import {
  CookieConfig,
  InteractsWithContentTypes,
  HttpContext,
  HttpMethods,
  HttpRequest,
  HttpRequestHeaders,
  Protocol,
  RequestCookieBuilderCallback
} from '@supercharge/contracts'

declare module 'koa' {
  interface Request extends Koa.BaseRequest {
    body?: any
    rawBody?: any
    files?: Files
  }
}

export class Request extends Many(Macroable, InteractsWithState) implements HttpRequest, InteractsWithContentTypes {
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
   * The default cookie options.
   */
  private readonly cookieConfig: CookieConfig

  /**
   * Create a new response instance.
   */
  constructor (ctx: HttpContext, cookieConfig: CookieConfig) {
    super(ctx.raw)

    this.meta = { ctx }
    this.cookieConfig = cookieConfig
  }

  /**
   * Returns the HTTP context.
   */
  ctx (): HttpContext {
    return this.meta.ctx
  }

  /**
   * Returns the raw Node.js request.
   */
  req (): IncomingMessage {
    return this.koaCtx.req
  }

  /**
   * Returns the request method.
   */
  method (): HttpMethods {
    return this.koaCtx.request.method.toUpperCase() as HttpMethods
  }

  /**
   * Determine whether the request is using one of the given HTTP `methods`.
   */
  isMethod (methods: HttpMethods | HttpMethods[]): methods is HttpMethods {
    return ([] as HttpMethods[])
      .concat(methods)
      .includes(this.method())
  }

  /**
   * Returns the request’s URL path.
   */
  path (): string {
    return this.koaCtx.request.path
  }

  /**
   * Returns the request’s query parameters.
   */
  query<QueryParams = ParsedUrlQuery> (): QueryParameterBag<QueryParams> {
    return new QueryParameterBag<QueryParams>(this.koaCtx.query as QueryParams)
  }

  /**
   * Returns the plain query string, without the leading ?.
   */
  queryString (): string {
    return this.koaCtx.request.querystring
  }

  /**
   * Returns the request’s path parameters.
   */
  params<PathParams extends Record<string, string> = {}> (): InputBag<PathParams> {
    if (!this.koaCtx.params) {
      this.koaCtx.params = {}
    }

    return new InputBag<PathParams>(this.koaCtx.params as PathParams)
  }

  param (name: string): string | undefined
  param (name: string, defaultValue: string): string
  param (name: string, defaultValue?: string): string | undefined {
    return this.params().get(name, defaultValue)
  }

  /**
   * Returns the cookie bag.
   */
  cookies (): CookieBag {
    return new CookieBag(this.koaCtx.cookies, this.cookieConfig)
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
   * Returns the full URL including protocol, host[:port], path, and query string.
   */
  fullUrl (): string {
    return this.koaCtx.href
  }

  /**
   * Returns the protocol value.
   */
  protocol (): Protocol {
    return this.koaCtx.request.protocol
  }

  /**
   * Returns the request payload.
   */
  payload<T = any> (): T {
    return this.koaCtx.request.body
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
   */
  setPayload (payload: any): this {
    return tap(this, () => {
      this.koaCtx.request.body = payload
    })
  }

  /**
   * Returns the raw request payload
   */
  rawPayload (): any {
    return this.koaCtx.request.rawBody
  }

  /**
   * Store the given raw `payload` for this request.
   */
  setRawPayload (payload: any): this {
    return tap(this, () => {
      this.koaCtx.request.rawBody = payload
    })
  }

  /**
   * Returns all files on the request.
   */
  files (): FileBag {
    return FileBag.createFromBase(this.koaCtx.request.files)
  }

  /**
   * Assign the given `files` to the request.
   */
  setFiles (files: Files): this {
    return tap(this, () => {
      this.koaCtx.request.files = files
    })
  }

  /**
   * Returns the request header bag.
   */
  headers<RequestHeaders = HttpRequestHeaders> (): InputBag<RequestHeaders> {
    return new RequestHeaderBag<RequestHeaders>(this.koaCtx.headers as RequestHeaders)
  }

  /**
   * Returns the request header identified by the given `key`. The default
   * value will be returned if no header is present for the given key.
   */
  header<Header extends keyof HttpRequestHeaders> (key: Header): HttpRequestHeaders[Header]
  header<T, Header extends keyof HttpRequestHeaders> (key: Header, defaultValue: T): HttpRequestHeaders[Header] | T
  header<T, Header extends keyof HttpRequestHeaders> (key: Header, defaultValue?: T): HttpRequestHeaders[Header] | T {
    return this.headers().get(key, defaultValue)
  }

  /**
   * Determine whether the request contains a header with the given `key`.
   */
  hasHeader<Header extends keyof HttpRequestHeaders> (key: Header): boolean {
    return this.headers().has(key)
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
   * Determine whether the request method is cacheable.
   * Cacheable methods are `HEAD` and `GET`.
   *
   * @see https://tools.ietf.org/html/rfc7231#section-4.2.3
   */
  isMethodCacheable (): boolean {
    return ['GET', 'HEAD'].includes(this.method().toUpperCase())
  }

  /**
   * Determine whether the request method is not cacheable.
   * Not cacheable methods are `POST`, `PUT`, `DELETE`, `PATCH`, and `OPTIONS`.
   *
   * @see https://tools.ietf.org/html/rfc7231#section-4.2.3
   */
  isMethodNotCacheable (): boolean {
    return !this.isMethodCacheable()
  }

  /**
   * Returns the client’s user agent.
   */
  userAgent (): IncomingHttpHeaders['user-agent'] {
    return this.header('user-agent')
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
    return !!this.koaCtx.request.is(
      ([] as string[]).concat(...types)
    )
  }

  /**
   * Determine whether the request is sending JSON payload.
   */
  isJson (): boolean {
    return Str(
      this.contentType()
    ).contains('/json', '+json')
  }

  /**
   * Determine whether the request is asking for a JSON response.
   */
  wantsJson (): boolean {
    return Str(
      this.header('accept')
    ).contains('/json', '+json')
  }

  /**
   * Determine whether the request is asking for an HTML response.
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
  contentType (): HttpRequestHeaders['content-type'] {
    return this.header('content-type')
  }

  /**
   * Determine whether the request the request is an XMLHttpRequest.
   */
  isXmlHttpRequest (): boolean {
    return this.headers<IncomingHttpHeaders>().get('X-Requested-With') === 'XMLHttpRequest'
  }

  /**
   * Determine whether the request is the result of an AJAX call.
   * This is an alias for {@link HttpRequest#isXmlHttpRequest}.
   */
  isAjax (): boolean {
    return this.isXmlHttpRequest()
  }

  /**
   * Determine whether the request is the result of a PJAX call.
   */
  isPjax (): boolean {
    return this.headers<IncomingHttpHeaders>().has('X-PJAX')
  }

  /**
   * Determine whether the request is the result of a prefetch call.
   */
  isPrefetch (): boolean {
    return Arr
      .from([
        this.headers<IncomingHttpHeaders>().get('X-moz'),
        this.headers<IncomingHttpHeaders>().get('Purpose')
      ])
      .has(value => typeof value === 'string' && value.toLowerCase() === 'prefetch')
  }
}
