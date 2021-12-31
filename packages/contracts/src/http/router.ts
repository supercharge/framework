'use strict'

import { Class } from '../utils'
import { HttpRoute } from './route'
import { HttpContext } from './context'
import { MiddlewareCtor } from './middleware'
import { HttpController } from './controller'
import { PendingRoute } from './pending-route'
import { HttpRouteCollection } from './route-collection'

type ControllerAction = Class<HttpController>
type InlineRouteHandler = (ctx: HttpContext) => any | Promise<any>

export type RouteHandler = ControllerAction | InlineRouteHandler

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
   *
   * @example
   * ```
   * // use a controller method to handle the request
   * Route.post('/login', 'AuthController.login')
   *
   * // use an inline route handler callback to handle the request
   * Route.post('/signup', async (ctx: HttpContext) => {
   *   // process the request
   * })
   * ```
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
   * Returns the route collection.
   */
  routes(): HttpRouteCollection

  /**
   * Create a route group.
   */
  group (prefixOrCallback: string | (() => void)): void
  group (attributes: RouteAttributes, callback: () => void): void

  /**
   * Set a route prefix.
   *
   * @example
   * ```
   * Route.prefix('/user').group(() => {
   *   Route.get('/profile', 'UserProfileController.index')
   *   Route.get('/settings', 'UserSettingsController.index')
   * })
   *
   * // the prefixed route group creates the following two routes:
   * // GET /user/profile
   * // GET /user/settings
   * ```
   */
  prefix(prefix: string): PendingRoute

  /**
   * Set a middlware stack.
   *
   * @example
   * ```
   * // use the 'auth' middleware to require authentication for all requests in this group
   * Route.middleware('auth').group(() => {
   *   Route.get('/user/profile', UserProfileController)
   *   Route.get('/user/settings', UserSettingsController)
   * })
   * ```
   */
  middleware(middleware: string | string[]): PendingRoute

  /**
   * Determine whether a middleware exists for the given `name`.
   */
  hasMiddleware(middleware: string | Class<MiddlewareCtor>): boolean

  /**
   * Register a named middleware.
   */
  registerAliasMiddleware(name: string, Middleware: MiddlewareCtor): HttpRouter

  /**
   * Returns a middleware-function for the HTTP server handling
   * the route-matching for an incoming request to the server.
   */
  createRoutingMiddleware(): any
}
