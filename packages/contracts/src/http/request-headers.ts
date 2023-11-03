
import { IncomingHttpHeaders } from 'http2'

// copy every declared property from http.IncomingHttpHeaders
// but remove index signatures

/**
 * This type copies over all properties from the `IncomingHttpHeaders` type
 * except the index signature. The index signature is nice to use custom
 * HTTP headers, but it throws away IntelliSense which we want to keep.
 */
export type HttpDefaultRequestHeaders = {
  [K in keyof IncomingHttpHeaders as string extends K
    ? never
    : number extends K
      ? never
      : K
  ]: IncomingHttpHeaders[K];
}

export type HttpDefaultRequestHeader = keyof HttpDefaultRequestHeaders

/**
 * This `HttpRequestHeaders` interface can be used to extend the default
 * HTTP headers with custom header key-value pairs. The HTTP request
 * picks up the custom headers and keeps IntelliSense for the dev.
 *
 * You can extend this interface in your code like this:
 *
 * @example
 *
 * ```ts
 *  declare module '@supercharge/contracts' {
 *    export interface HttpRequestHeaders {
 *      'your-header-name': string | undefined
 *    }
 *  }
 * ```
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpRequestHeaders extends HttpDefaultRequestHeaders {
  //
}

export type HttpRequestHeader = keyof HttpRequestHeaders
