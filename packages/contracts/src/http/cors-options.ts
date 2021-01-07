'use strict'

export interface CorsOptions {
  /**
   * Tba.
   */
  maxAge?: number

  /**
   * `Access-Control-Allow-Origin`, default is request Origin header.
   */
  origin?: string // | ((ctx: HttpContext) => string) | ((ctx: HttpContext) => PromiseLike<string>)

  /**
   * `Access-Control-Allow-Methods`
   */
  allowMethods: string | string[]

  /**
   * `Access-Control-Allow-Headers`
   */
  allowHeaders?: string | string[]

  /**
   * `Access-Control-Expose-Headers`
   */
  exposeHeaders?: string | string[]

  /**
   * `Access-Control-Allow-Credentials`
   */
  credentials?: boolean

  /**
   * Add set headers to `err.header` if an error is thrown
   */
  keepHeadersOnError?: boolean
}
