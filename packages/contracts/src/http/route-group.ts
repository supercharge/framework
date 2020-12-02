'use strict'

export interface HttpRouteGroup {
  /**
   * Create a GET route.
   */
  prefix(prefix: string): this

  /**
   * Append a single middleware or an array of middleware to this route group.
   */
  middleware(middleware: string): this
}
