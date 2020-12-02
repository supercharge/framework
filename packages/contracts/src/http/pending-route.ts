'use strict'

import { RouteHandler } from './router'

export interface PendingRoute {
  /**
   * Assign a route prefix.
   */
  prefix(prefix: string): PendingRoute

  /**
   * Assign a middleware to the route.
   */
  middleware(middleware: string | string[]): PendingRoute

  /**
   * Create a route group
   */
  group (callback: () => void): void

  /**
   * Create a GET route.
   */
  get(path: string, handler: RouteHandler): void

  /**
   * Create a POST route.
   */
  post(path: string, handler: RouteHandler): void

  /**
   * Create a PUT route.
   */
  put(path: string, handler: RouteHandler): void

  /**
   * Create a DELETE route.
   */
  delete(path: string, handler: RouteHandler): void

  /**
   * Create a PATCH route.
   */
  patch(path: string, handler: RouteHandler): void
}
