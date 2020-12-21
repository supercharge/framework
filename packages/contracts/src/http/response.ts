'use strict'

import { CookieOptions } from './cookie-options'

export interface HttpRedirect {
  /**
   * Redirect the request back to the previous path.
   */
  back(options?: { fallback: string }): void

  /**
   * Redirects the request with HTTP status 307. This keeps the request payload
   * which is useful for POST/PUT requests containing content.
   *
   * More details: Details: https://developer.mozilla.org/de/docs/Web/HTTP/Status
   */
  withPayload(): this

  /**
   * Redirect the request to the given URL `path`.
   *
   * @param url string
   */
  to(path: string): void
}

export interface HttpResponse {
  /**
   * Set a response header.
   *
   * @example
   * ```
   * response.header('x-app-name', 'Supercharge')
   * ```
   */
  header(key: string, value: any): this

  /**
   * Returns the response headers.
   *
   * @example
   * ```
   * const responseHeaders = response.header('Content-Type', 'application/json').headers()
   * // { 'Content-Type': 'application/json' }
   * ```
   */
  headers(): { [key: string]: unknown }

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
  withHeaders(headers: { [key: string]: any }): this

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
  appendHeader(key: string, value: any): this

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
   * response.cookie('name', 'value', options)
   * ```
   */
  cookie(key: string, value: any, options: CookieOptions): this

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
}
