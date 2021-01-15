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
}
