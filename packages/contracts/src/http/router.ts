'use strict'

import { HttpContext } from './context'
import { PendingRoute } from './pending-route'

export type RouteHandler = (ctx: HttpContext) => unknown | Promise<unknown>

export type HttpMethod = 'get' | 'head' | 'post' | 'put' | 'delete' | 'patch' | 'options'

export interface RouteAttributes {
  prefix: string
  middleware: string[]
}

export interface HttpRouter {
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

  /**
   * Create an OPTIONS route.
   */
  options(path: string, handler: RouteHandler): void

  /**
   * Create a GET route.
   */
  group (callback: () => void): void
  group (attributes: RouteAttributes, callback: () => void): void

  /**
   * Create a GET route.
   */
  prefix(prefix: string): PendingRoute

  /**
   * Create a GET route.
   */
  middleware(middleware: string | string[]): PendingRoute
}
