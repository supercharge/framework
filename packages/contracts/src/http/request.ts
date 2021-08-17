'use strict'

import { HeaderBag } from './header-bag'
import { InteractsWithContentTypes } from './concerns'

export interface HttpRequest extends InteractsWithContentTypes {
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
  headers(): HeaderBag

  /**
   * Returns the request header identified by the given `key`. The default
   * value will be returned if no header is present for the given key.
   */
  header(key: string, defaultValue?: string | string[]): string | string[] | undefined

  /**
   * Determine whether the request contains a header with the given `key`.
   */
  hasHeader(key: string): boolean
}
