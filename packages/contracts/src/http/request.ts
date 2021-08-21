'use strict'

import { HeaderBag } from './header-bag'
import { ParameterBag } from './parameter-bag'
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
  query(): ParameterBag

  /**
   * Returns the path parameter bag.
   */
  params(): ParameterBag

  /**
   * Returns the path parameter for the given `name`. Returns the
   * `defaultValue` if a parameter for the name doesn’t exist.
   */
  param<T = any>(name: string, defaultValue: T): T

  /**
   * Returns the request payload.
   */
  payload(): any

  /**
   * Returns the merged request payload with query parameters. The query
   * parameters take preceedence over the request payload in case
   * attributes with the same name are defined in both places.
   */
  all (): Record<string, any>

  /**
   * Returns an input item for the given `name` from the request payload or query parameters.
   * Returns the `defaultValue` if a parameter for the name doesn’t exist.
   */
  input<T = any> (name: string, defaultValue?: T): T

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
