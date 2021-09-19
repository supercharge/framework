'use strict'

import { FileBag } from './file-bag'
import { IncomingMessage } from 'http'
import { HeaderBag } from './header-bag'
import { ParameterBag } from './parameter-bag'
import { InteractsWithContentTypes } from './concerns'
import { RequestCookieBuilderCallback } from './cookie-options-builder'

export interface HttpRequest extends InteractsWithContentTypes {
  /**
   * Returns the raw Node.js request.
   */
  req(): IncomingMessage

  /**
   * Returns the request method.
   */
  method (): string

  /**
   * Returns the request’s URL path.
   */
  path (): string

  /**
   * Returns the query parameter bag.
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
  param<T = any>(name: string, defaultValue?: T): T

  /**
   * Returns the cookie value for the given `name`. Supports an options
   * builder as the second argument allowing you to change whether you
   * want to retrieve the cookie `unsigned` from the incomig request.
   */
  cookie(name: string, cookieBuilder?: RequestCookieBuilderCallback): string | undefined

  /**
   * Returns the merged request payload, files and query parameters. The query parameters
   * take preceedence over the request payload and files. Files take preceedence over the
   * request payload in case attributes with the same name are defined in both places.
   */
  all (): { [key: string]: any }

  /**
   * Returns an input item for the given `name` from the request payload or query parameters.
   * Returns the `defaultValue` if a parameter for the name doesn’t exist.
   */
  input<T = any> (name: string, defaultValue?: T): T

  /**
   * Returns the request payload.
   */
  payload(): any

  /**
   * Determine whether a request body exists.
   */
  hasPayload(): boolean

  /**
   * Assign the given `payload` as the request body.
   */
  setPayload(payload: any): this

  /**
   * Returns the raw request payload
   */
  rawPayload(): any

  /**
    * Store the given raw `payload` for this request.
    */
  setRawPayload(payload: any): this

  /**
   * Returns all files on the request.
   */
  files(): FileBag

  /**
   * Assign the given `files` to the request.
   */
  setFiles(files: { [name: string]: any }): this

  /**
   * Returns the request header bag.
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
