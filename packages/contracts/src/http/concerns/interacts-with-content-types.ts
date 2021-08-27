'use strict'

export interface InteractsWithContentTypes {
  /**
   * Determine whether the request is sending JSON payload.
   *
   * @example
   * ```
   * request.isJson()
   * ```
   */
  isJson (): boolean

  /**
   * Determine whether the request is asking for a JSON response.
   *
   * @example
   * ```
   * request.wantsJson()
   * ```
   */
  wantsJson (): boolean

  /**
   * Determine whether the request is asking for an HTML response.
   *
   * @example
   * ```
   * request.wantsHtml()
   * ```
   */
  wantsHtml (): boolean

  /**
   * Returns the request’s content mime type from the `Content-Type` header field.
   *
   * @example
   * ```
   * request.contentType()
   * ```
   */
  contentType (): string | undefined

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
   * request.isContentType('application/json', 'application/json') // true
   *
   * request.isContentType('json', 'html') // true
   * request.isContentType('text/html') // false
   * request.isContentType('html') // false
   * ```
   */
  isContentType (types: string[]): boolean
  isContentType (...types: string[]): boolean
}
