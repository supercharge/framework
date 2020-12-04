'use strict'

export interface HttpRequest {
  /**
   * Returns the request’s URL path.
   */
  path (): string

  /**
   * Returns the query parameter object.
   */
  query(): { [key: string]: unknown }

  /**
   * Set a new query parameter object.
   */
  // setQuery(query: { [key: string]: unknown }): this

  /**
   * Returns the path parameter object.
   */
  params(): { [key: string]: unknown }

  /**
   * Returns the request payload.
   */
  payload(): any

  /**
   * Returns the request headers.
   */
  headers(): any
}
