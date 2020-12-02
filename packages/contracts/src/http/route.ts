'use strict'

export interface HttpRoute {
  /**
   * Assign a route prefix.
   */
  prefix(prefix: string): this

  /**
   * Assign a middleware to the route.
   */
  middleware(middleware: string): this
}
