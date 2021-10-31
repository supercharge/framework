'use strict'

export interface CorsOptions {
  /**
   * Controls the `Access-Control-Max-Age` header in seconds.
   */
  maxAge?: number

  /**
   * `Access-Control-Allow-Methods`
   */
  allowedMethods: string | string[]

  /**
   * `Access-Control-Allow-Origin`, default is request Origin header.
   */
  allowedOrigin?: string

  /**
   * `Access-Control-Allow-Headers`
   */
  allowedHeaders?: string | string[]

  /**
   * `Access-Control-Expose-Headers`
   */
  exposedHeaders?: string | string[]

  /**
   * `Access-Control-Allow-Credentials`
   */
  supportsCredentials?: boolean
}
