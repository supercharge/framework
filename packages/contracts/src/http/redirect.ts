'use strict'

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
  to(path: string): this
}
