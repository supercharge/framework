'use strict'

import { ViewConfigBuilder } from '../view'
import { InteractsWithState } from './concerns/interacts-with-state'
import { HeaderBag, HttpRedirect, ResponseCookieBuilderCallback } from '.'

export interface HttpResponse extends InteractsWithState {
  /**
   * Set a response header.
   *
   * @example
   * ```
   * response.header('x-app-name', 'Supercharge')
   * ```
   */
  header(key: string, value: string | string[] | number): this

  /**
   * Returns the response headers.
   *
   * @example
   * ```
   * const responseHeaders = response.header('Content-Type', 'application/json').headers()
   * // { 'Content-Type': 'application/json' }
   * ```
   */
  headers(): HeaderBag<string | string[] | number>

  /**
   * Assign the object’s key-value pairs as response headers.
   *
   * @example
   * ```
   * response.withHeaders({
   *   'x-app-name': 'Supercharge',
   *   'x-last-visit': 16482123123123
   * })
   * ```
   */
  withHeaders(headers: Record<string, string | string[] | number>): this

  /**
   * Append a header to the response. If you want to replance a possibly
   * existing response header, use the `response.header()` method.
   *
   * @example
   * ```
   * response.appendHeader('set-cookie', 'name=marcus')
   * response.appendHeader('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
   * ```
   */
  appendHeader(key: string, value: string | string[] | number): this

  /**
   * Remove a header field from the response.
   *
   * @example
   * ```
   * response.removeHeader('content-type')
   * ```
   */
  removeHeader(key: string): this

  /**
   * Assign the given cookie to the response.
   *
   * @example
   * ```
   * response.cookie('name', 'value', cookie => {
   *   cookie.expires('7d')
   * })
   * ```
   */
  cookie(key: string, value?: string | null, cookieBuilder?: ResponseCookieBuilderCallback): this

  /**
   * Set the response payload.
   *
   * @example
   * ```
   * response.payload('Hello Supercharge')
   * response.payload({ id: 1, name: 'Marcus' })
   * response.payload([{ id: 1, name: 'Marcus' }, { id: 2, name: 'Supercharge' }])
   * ```
   */
  payload(payload: any): this

  /**
   * Set a response status.
   *
   * @example
   * ```
   * response.status(206)
   * ```
   */
  status (status: number): this

  /**
   * Temporarily redirect the request using HTTP status code 302. You can customize
   * the redirect when omitting any parameter to this `response.redirect()` method.
   *
   * @example
   * ```
   * response.redirect('/login')
   *
   * response.redirect().to('/login')
   *
   * response.redirect().back()
   * response.redirect().back({ fallback: '/' })
   * ```
   */
  redirect (): HttpRedirect
  redirect (url: string): void

  /**
   * Permanently redirect the request using HTTP status code 301.
   *
   * @example
   * ```
   * response.permanentRedirect('/')
   *
   * response.permanentRedirect().to('/login')
   * response.permanentRedirect().back({ fallback: '/login'})
   * ```
   */
  permanentRedirect (): HttpRedirect
  permanentRedirect (url: string): void

  /**
   * Set the response `Content-Type` header. This will look up the mime type
   * and set the related value as the content type header field. It also
   * removes the content type header if no valid mime type is available.
   *
   * @example
   * ```
   * response.type('json') // results in `Content-Type`: 'application/json'
   * response.type('application/json') // results in `Content-Type`: 'application/json'
   * ```
   */
  type (contentType: string): this

  /**
   * Set the response ETag. This will normalize quotes if necessary.
   *
   * @example
   * ```
   * response.etag('hashsum')
   * response.etag('W/"123456789"')
   * ```
   */
  etag (etag: string): this

  /**
   * Render a view template as the response.
   *
   * @example
   * ```
   * response.view('welcome')
   * response.view('welcome', view => {
   *   view.layout('landing')
   * })
   * response.view('user/dashboard', { user: { id: 1, name: 'Marcus' } })
   * response.view('user/dashboard', { user: { id: 1, name: 'Marcus' } }, view => {
   *   view.layout('profile')
   * })
   * ```
   */
  view (template: string, callback?: (viewBuilder: ViewConfigBuilder) => unknown): Promise<this>
  view (template: string, data?: any, callback?: (viewBuilder: ViewConfigBuilder) => unknown): Promise<this>

  /**
   * Abort the request and throw an error with the given `status`. The status defaults
   * to 500. You may pass an error message or error instance as the second argument.
   * Use the third, optional argument for properties in the error response.
   *
   * @example
   * ```
   * response.throw(403)
   * response.throw(400, 'Missing username')
   * response.throw(401, new Error('Invalid bearer token.'))
   * response.throw(403, 'Access denied.', { user })
   * ```
   */
  throw (status: number): void
  throw (status: number | string | Error): void
  throw (status: number, message?: string, properties?: {}): void
}
