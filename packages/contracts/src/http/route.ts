'use strict'

import { HttpContext } from './context'
import { HttpMethods } from './methods'
import { RouteHandler } from './router'

export interface HttpRoute {
  /**
   * Assign a route prefix.
   */
  prefix(prefix: string): this

  /**
   * Assign a middleware to the route.
   */
  middleware(middleware: string | string[]): this

  /**
   * Returns the route path.
   */
  path (): string

  /**
   * Returns the route’s HTTP methods.
   */
  methods (): HttpMethods[]

  /**
   * Returns the route handler.
   */
  handler (): RouteHandler

  /**
   * Run the route handler.
   */
  run (ctx: HttpContext): Promise<any>
}
