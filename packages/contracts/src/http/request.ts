'use strict'

import { IncomingHttpHeaders } from 'http'
import { InteractsWithContentTypes } from './concerns'

export interface HttpRequest extends InteractsWithContentTypes {
  /**
   * Returns the request’s async iterator.
   *
   * @returns {AsyncIterator}
   */
  [Symbol.asyncIterator] (): AsyncIterator<any>

  /**
   * Returns the request method.
   */
  method (): string

  /**
   * Returns the request’s URL path.
   */
  path (): string

  /**
   * Returns the query parameter object.
   */
  query: Record<string, any>

  /**
   * Returns the path parameter object.
   */
  params: Record<string, any>

  /**
   * Returns the request payload.
   */
  payload: any

  /**
   * Returns the request headers.
   */
  headers: IncomingHttpHeaders

  /**
   * Returns the request header identified by the given `key`. The default
   * value will be returned if no header is present for the given key.
   */
  header(key: string, defaultValue?: any): string | undefined

  /**
   * Determine whether the request contains a header with the given `key`.
   */
  hasHeader(key: string): boolean
}
