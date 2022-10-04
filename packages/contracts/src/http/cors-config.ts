'use strict'

/**
 * @deprecated The `CorsOptions` is deprecated in favor of the `CorsConfig`
 * interface. We’ll remove the `CorsOptions` interface in the upcoming
 * release of the Supercharge framework. You may already switch to the renamed interface.
 */
export type CorsOptions = CorsConfig

export interface CorsConfig {
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
