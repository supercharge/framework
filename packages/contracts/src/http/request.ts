'use strict'

import { URL } from './url'
import { FileBag } from './file-bag'
import { HttpMethods } from './methods'
import { HttpContext } from './context'
import { CookieBag } from './cookie-bag'
import { ParameterBag } from './parameter-bag'
import { CookieOptions } from './cookie-options'
import { MacroableCtor } from '@supercharge/macroable'
import { RequestHeaderBag } from './request-header-bag'
import { IncomingHttpHeaders, IncomingMessage } from 'http'
import { RequestCookieBuilderCallback } from './cookie-options-builder'
import { InteractsWithContentTypes, InteractsWithState } from './concerns'

export interface HttpRequestCtor extends MacroableCtor {
  /**
   * Create a new HTTP request instance.
   */
  new (context: HttpContext, cookieOptions: CookieOptions): HttpRequest
}

export interface HttpRequest extends InteractsWithState, InteractsWithContentTypes {
  /**
   * Returns the HTTP context.
   */
  ctx (): HttpContext

  /**
   * Returns the raw Node.js request.
   */
  req(): IncomingMessage

  /**
   * Returns the request method.
   */
  method (): HttpMethods

  /**
   * Determine whether the request is using the given HTTP `method`.
   */
  isMethod (method: HttpMethods): method is HttpMethods

  /**
   * Determine whether the request method is cacheable.
   * Cacheable methods are `HEAD` and `GET`.
   *
   * @see https://tools.ietf.org/html/rfc7231#section-4.2.3
   */
  isMethodCacheable(): boolean

  /**
   * Determine whether the request method is not cacheable.
   * Not cacheable methods are `POST`, `PUT`, `DELETE`, `PATCH`, and `OPTIONS`.
   *
   * @see https://tools.ietf.org/html/rfc7231#section-4.2.3
   */
  isMethodNotCacheable(): boolean

  /**
   * Returns the request’s URL path.
   */
  path (): string

  /**
   * Returns the query parameter bag.
   */
  query(): ParameterBag<string | string[]>

  /**
   * Returns the plain query string, without the leading ?.
   */
  queryString(): string

  /**
   * Returns the path parameter bag.
   */
  params(): ParameterBag<string>

  /**
   * Returns the path parameter for the given `name`. Returns the
   * `defaultValue` if a parameter for the name doesn’t exist.
   */
  param (name: string): string | undefined
  param (name: string, defaultValue: string): string

  /**
   * Returns the cookie bag.
   */
  cookies (): CookieBag

  /**
   * Returns the cookie value for the given `name`. Supports an options
   * builder as the second argument allowing you to change whether you
   * want to retrieve the cookie `unsigned` from the incomig request.
   */
  cookie(name: string, cookieBuilder?: RequestCookieBuilderCallback): string | undefined

  /**
   * Determine whether a cookie exists for the given `name`.
   */
  hasCookie (name: string): boolean

  /**
   * Returns a url instance for this request.
   */
  url(): URL

  /**
   * Returns the full URL including protocol[:port], host, path, and query string.
   *
   * @example
   * ```ts
   * request.fullUrl()
   * // http://localhost:3000/users?query=Joe
   * ```
   */
  fullUrl(): string

  /**
   * Returns the merged request payload, files and query parameters. The query parameters
   * take preceedence over the request payload and files. Files take preceedence over the
   * request payload in case attributes with the same name are defined in both places.
   */
  all (): { [key: string]: any }

  /**
   * Returns an input item for the given `name` from the request payload or query parameters.
   * Returns the `defaultValue` if a parameter for the name doesn’t exist.
   */
  input<T = any> (name: string, defaultValue?: T): T

  /**
   * Returns the request payload.
   */
  payload<T = any>(): T

  /**
   * Determine whether a request body exists.
   */
  hasPayload(): boolean

  /**
   * Assign the given `payload` as the request body.
   */
  setPayload(payload: any): this

  /**
   * Returns the raw request payload
   */
  rawPayload(): any

  /**
    * Store the given raw `payload` for this request.
    */
  setRawPayload(payload: any): this

  /**
   * Returns all files on the request.
   */
  files(): FileBag

  /**
   * Assign the given `files` to the request.
   */
  setFiles(files: { [name: string]: any }): this

  /**
   * Returns the request header bag.
   */
  headers(): RequestHeaderBag

  /**
   * Returns the request header identified by the given `key`. The default
   * value will be returned if no header is present for the given key.
   */
  header<Header extends keyof IncomingHttpHeaders> (key: Header): IncomingHttpHeaders[Header]
  header<T, Header extends keyof IncomingHttpHeaders> (key: Header, defaultValue: T): IncomingHttpHeaders[Header] | T

  /**
   * Determine whether the request contains a header with the given `key`.
   */
  hasHeader(key: string): boolean

  /**
   * Returns the request’s content size as a number retrieved from the `Content-Length` header field.
   *
   * @example
   * ```
   * request.contentLength()
   * ```
   */
  contentLength (): number

  /**
   * Returns the client’s user agent.
   */
  userAgent (): IncomingHttpHeaders['user-agent']

  /**
   * Determine whether the request the request is an XMLHttpRequest.
   */
  isXmlHttpRequest(): boolean

  /**
   * Determine whether the request is the result of an AJAX call.
   * This is an alias for {@link HttpRequest#isXmlHttpRequest}.
   */
  isAjax(): boolean

  /**
   * Determine whether the request is the result of a PJAX call.
   */
  isPjax(): boolean

  /**
   * Determine whether the request is the result of a prefetch call.
   */
  isPrefetch(): boolean
}
