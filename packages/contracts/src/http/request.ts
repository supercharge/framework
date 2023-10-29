
import { FileBag } from './file-bag.js'
import { InputBag } from './input-bag.js'
import { HttpMethods } from './methods.js'
import { HttpContext } from './context.js'
import { CookieBag } from './cookie-bag.js'
import { CookieOptions } from './cookie-options.js'
import { MacroableCtor } from '@supercharge/macroable'
import { RequestHeaderBag } from './request-header-bag.js'
import { QueryParameterBag } from './query-parameter-bag.js'
import { IncomingHttpHeaders, IncomingMessage } from 'node:http'
import { InteractsWithState } from './concerns/interacts-with-state.js'
import { RequestCookieBuilderCallback } from './cookie-options-builder.js'
import { InteractsWithContentTypes } from './concerns/interacts-with-content-types.js'

export interface HttpRequestCtor extends MacroableCtor {
  /**
   * Create a new HTTP request instance.
   */
  new (context: HttpContext, cookieOptions: CookieOptions): HttpRequest
}

export type Protocol = 'http' | 'https' | string

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
  isMethod (methods: HttpMethods | HttpMethods[]): methods is HttpMethods

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
  query<QueryParams extends Record<string, string | string[]> = {}>(): QueryParameterBag<QueryParams>

  /**
   * Returns the plain query string, without the leading ?.
   */
  queryString(): string

  /**
   * Returns the path parameter bag.
   */
  params<PathParams extends Record<string, string> = {}> (): InputBag<PathParams>

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
   * Returns the protocol value.
   */
  protocol(): Protocol

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
