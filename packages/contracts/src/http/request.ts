'use strict'

import { InteractsWithContentTypes } from './concerns'
import { IncomingHttpHeaders, IncomingMessage } from 'http'
import { FileBag } from './file-bag'

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
  setFiles(files: any): this

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
