'use strict'

import { HttpRoute } from './route'
import { HttpContext } from './context'
import { PendingRoute } from './pending-route'

export type RouteHandler = (ctx: HttpContext) => unknown | Promise<unknown>

export type HttpMethod = 'get' | 'head' | 'post' | 'put' | 'delete' | 'patch' | 'options'

export interface RouteAttributes {
  /**
   * A prefix that will be applied to all routes defined within the group callback.
   *
   * @example
   * ```
   * Route.group({ prefix: '/admin' }, () => {
   *   Route.get('/dashboard', () => {})
   *   Route.get('/analytics', () => {})
   * })
   *
   * // the route group from above creates the following two routes:
   * GET /admin/dashboard
   * GET /admin/analytics
   * ```
   */
  prefix?: string

  /**
   * A middleware stack (array) that will run for all routes defined in the group callback.
   *
   * @example
   * ```
   * Route.group({ middleware: 'redirectIfAuthenticated' }, () => {
   *   Route.get('/login', () => {})
   *   Route.get('/register', () => {})
   * })
   *
   * // the route group from above runs the 'redirectIfAuthenticated' middleware
   * // for the GET /login and GET /register routes
   * ```
   */
  middleware?: string[]
}

export interface HttpRouter {
  /**
   * Create a GET route.
   */
  get(path: string, handler: RouteHandler, middleware?: string[]): HttpRoute

  /**
   * Create a POST route.
   */
  post(path: string, handler: RouteHandler, middleware?: string[]): HttpRoute

  /**
   * Create a PUT route.
   */
  put(path: string, handler: RouteHandler, middleware?: string[]): HttpRoute

  /**
   * Create a DELETE route.
   */
  delete(path: string, handler: RouteHandler, middleware?: string[]): HttpRoute

  /**
   * Create a PATCH route.
   */
  patch(path: string, handler: RouteHandler, middleware?: string[]): HttpRoute

  /**
   * Create an OPTIONS route.
   */
  options(path: string, handler: RouteHandler): HttpRoute

  /**
   * Create a route group.
   */
  group (path: string): void
  group (callback: () => void): void
  group (attributes: RouteAttributes, callback: () => void): void

  /**
   * Set a route prefix.
   */
  prefix(prefix: string): PendingRoute

  /**
   * Set a middlware stack.
   */
  middleware(middleware: string | string[]): PendingRoute
}
