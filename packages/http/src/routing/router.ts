'use strict'

import { Route } from './route'
import Map from '@supercharge/map'
import { RouteGroup } from './group'
import Str from '@supercharge/strings'
import { Arr } from '@supercharge/arrays'
import { PendingRoute } from './pending-route'
import { RouteCollection } from './route-collection'
import KoaRouter, { RouterContext } from '@koa/router'
import { isNullish, tap, upon } from '@supercharge/goodies'
import { HttpContext, HttpRedirect, Response } from '../server'
import { isFunction, isNotConstructor } from '@supercharge/classes'
import { HttpRouter, RouteHandler, RouteAttributes, HttpMethods, MiddlewareCtor, NextHandler, Middleware, Application } from '@supercharge/contracts'

export class Router implements HttpRouter {
  private readonly meta: {
    /**
     * Stores the app instance.
     */
    app: Application

    /**
     * Stores the list of routes.
     */
    instance: KoaRouter

    /**
     * Stores the list of routes.
     */
    routes: RouteCollection

    /**
     * Stores the named route middleware.
     */
    middleware: Map<string, MiddlewareCtor>

    /**
     * Stores the opened route groups.
     */
    groupStack: RouteGroup[]
  }

  /**
   * Create a new router instance.
   */
  constructor (app: Application) {
    this.meta = {
      app,
      groupStack: [],
      middleware: new Map(),
      instance: new KoaRouter(),
      routes: new RouteCollection()
    }
  }

  /**
   * Returns the app instance.
   *
   * @returns {Application}
   */
  private app (): Application {
    return this.meta.app
  }

  /**
   * Returns the Koa router instance.
   *
   * @returns {KoaRouter}
   */
  private router (): KoaRouter {
    return this.meta.instance
  }

  /**
   * Returns the route collection.
   *
   * @returns {RouteCollection}
   */
  routes (): RouteCollection {
    return this.meta.routes
  }

  /**
   * Returns a middleware-function for the HTTP server handling
   * the route-matching for an incoming request to the server.
   *
   * @returns {Function}
   */
  createRoutingMiddleware (): any {
    return upon(this.registerRoutesToRouter(), () => {
      return this.router().middleware()
    })
  }

  /**
   * Register all collected routes to the router instance.
   */
  private registerRoutesToRouter (): void {
    this.routes().all().forEach(route => {
      this.register(route)
    })
  }

  /**
   * Register the given `route` and related route-level middleware to the router.
   *
   * @param route Route
   */
  private register (route: Route): void {
    this.router().register(route.path(), route.methods(), [
      ...this.createRouteMiddleware(route),
      this.createRouteHandler(route)
    ], { name: route.path() })
  }

  /**
   * Creates and returns the route-level middleware stack.
   *
   * @param route Route
   *
   * @returns {Function[]}
   */
  private createRouteMiddleware (route: Route): any[] {
    return route.getMiddleware().map(name => {
      this.ensureMiddlewareExists(name)

      return async (ctx: RouterContext, next: NextHandler) => {
        return await this.makeMiddleware(name).handle(
          this.createContext(ctx), next
        )
      }
    })
  }

  /**
   * Throws if the given middleware `name` is not registered in the middleware stack.
   *
   * @param name String
   *
   * @throws
   */
  ensureMiddlewareExists (name: string): void {
    if (this.isMissingMiddleware(name)) {
      throw new Error(`Route-level middleware "${name}" is not registered in your HTTP kernel`)
    }
  }

  /**
   * Determine whether the given middleware is not registered.
   *
   * @param name String
   *
   * @returns {Boolean}
   */
  isMissingMiddleware (name: string): boolean {
    return !this.hasMiddleware(name)
  }

  /**
   * Determine whether the given middleware is registered.
   *
   * @param name String
   *
   * @returns {Boolean}
   */
  hasMiddleware (name: string): boolean {
    return this.meta.middleware.has(name)
  }

  /**
   * Returns a new middleware instance.
   *
   * @param name String
   *
   * @returns {Middleware}
   */
  private makeMiddleware (name: string): Middleware {
    return this.app().make(
      this.meta.middleware.get(name) as MiddlewareCtor
    )
  }

  /**
   * Returns a Koa-compatible route handler.
   *
   * @param route Route
   *
   * @returns {Function}
   */
  private createRouteHandler (route: Route): Function {
    return async (ctx: RouterContext, next: NextHandler) => {
      await this.handleRequest(route, this.createContext(ctx))
      await next()
    }
  }

  /**
   * Handle the given request context for the related route.
   *
   * @param route Route
   * @param ctx Koa Context
   */
  async handleRequest (route: Route, ctx: HttpContext): Promise<void> {
    const response = await route.run(ctx)

    /**
     * Not returning a value from the route handler is an option because the context contains
     * a response instance and this has a reference to the underlying Koa response. Yet,
     * for consistency reasons we force users to return a value from route handlers.
     */
    if (isNullish(response)) {
      throw new Error(
        `Missing return value in route handler for route "${route.methods().toString().toUpperCase()} ${route.path()}"`
      )
    }

    /**
     * The returned response from the route handler is an instance of the `Response` class
     * if the developer uses and returns the fluent response interface. The interface
     * assigns the values to the underlying response. No extra work needed here.
     */
    if (response instanceof Response) {
      return
    }

    /**
     * The returned response is an HTTP redirect composed using the fluent redirect
     * interface. The HTTP redirect class automatically configured the Koa context.
     * We can return early here because there’s no need to set an extra payload.
     */
    if (response instanceof HttpRedirect) {
      return
    }

    /**
     * When a developer returns a plain value, like a string/object/array/etc., we’ll
     * assign the returned value as the response value. In case the response value
     * is an empty string, we’ll also set the response status to 204 (No Content).
     */
    response === ''
      ? ctx.response.payload(response).status(204)
      : ctx.response.payload(response)
  }

  /**
   * Wrap the given Koa `ctx` into a Supercharge ctx.
   *
   * @param ctx
   *
   * @returns {HttpContext}
   */
  private createContext (ctx: any): HttpContext {
    return HttpContext.wrap(ctx, this.app())
  }

  /**
   * Returns the route group stack.
   *
   * @returns {RouteGroup[]}
   */
  groupStack (): RouteGroup[] {
    return this.meta.groupStack
  }

  /**
   * Create a GET route.
   *
   * @param {String} path
   * @param {RouteHandler} handler
   * @param {String[]} middleware
   *
   * @returns {Route}
   */
  get (path: string, handler: RouteHandler, middleware?: string[]): Route {
    return this.addRoute(['GET', 'HEAD'], path, handler, middleware)
  }

  /**
   * Create a POST route.
   *
   * @param {String} path
   * @param {RouteHandler} handler
   * @param {String[]} middleware
   *
   * @returns {Route}
   */
  post (path: string, handler: RouteHandler, middleware?: string[]): Route {
    return this.addRoute(['POST'], path, handler, middleware)
  }

  /**
   * Create a PUT route.
   *
   * @param {String} path
   * @param {RouteHandler} handler
   * @param {String[]} middleware
   *
   * @returns {Route}
   */
  put (path: string, handler: RouteHandler, middleware?: string[]): Route {
    return this.addRoute(['PUT'], path, handler, middleware)
  }

  /**
   * Create a DELETE route.
   *
   * @param {String} path
   * @param {RouteHandler} handler
   * @param {String[]} middleware
   *
   * @returns {Route}
   */
  delete (path: string, handler: RouteHandler, middleware?: string[]): Route {
    return this.addRoute(['DELETE'], path, handler, middleware)
  }

  /**
   * Create a PATCH route.
   *
   * @param {String} path
   * @param {RouteHandler} handler
   * @param {String[]} middleware
   *
   * @returns {Route}
   */
  patch (path: string, handler: RouteHandler, middleware?: string[]): Route {
    return this.addRoute(['PATCH'], path, handler, middleware)
  }

  /**
   * Create an OPTIONS route.
   *
   * @param {String} path
   * @param {RouteHandler} handler
   * @param {String[]} middleware
   *
   * @returns {Route}
   */
  options (path: string, handler: RouteHandler): Route {
    return this.addRoute(['OPTIONS'], path, handler)
  }

  /**
   * Create a new route and add it to the routes collection.
   *
   * @param {HttpMethods} method
   * @param {String} path
   * @param {RouteHandler} handler
   *
   * @returns {Route}
   */
  addRoute (methods: HttpMethods[], path: string, handler: RouteHandler, middleware?: string[]): Route {
    return tap(this.createRoute(methods, path, handler, middleware), route => {
      return this.routes().add(route)
    })
  }

  /**
   * Create a new route instance.
   *
   * @param {HttpMethods} method
   * @param {String} path
   * @param {RouteHandler} handler
   *
   * @returns {Route}
   */
  createRoute (methods: HttpMethods[], path: string, handler: RouteHandler, middleware?: string[]): Route {
    const route = new Route(methods, path, handler, this.app()).middleware(middleware)

    if (this.hasGroupStack()) {
      this.mergeGroupAttributesIntoRoute(route)
    }

    return route
  }

  /**
   * Determine whether an active route group exists.
   *
   * @returns {Boolean}
   */
  hasGroupStack (): boolean {
    return Arr.from(
      this.getLastGroup()
    ).isNotEmpty()
  }

  /**
   * Returns the last route group.
   *
   * @returns {RouteGroup | undefined}
   */
  getLastGroup (): RouteGroup | undefined {
    return Arr.from(
      this.groupStack()
    ).last()
  }

  /**
   * Merge the group attributes into the given route.
   *
   * @param {Route} route
   */
  mergeGroupAttributesIntoRoute (route: Route): void {
    const group = this.getLastGroup()

    if (group) {
      route
        .prefix(group.prefix())
        .middleware(group.middleware())
    }
  }

  /**
   * Create a new route group.
   *
   * @param callback Function
   *
   * @returns {RouteGroup}
   */
  group (prefixOrCallback: string | (() => void)): void
  group (attributes: RouteAttributes, callback: () => void): void
  group (attributes: any, callback?: () => void): void {
    /**
     * If only a single argument is provided by the user, we expect it to be the
     * callback function. That’s the reason we’re reassigning the variables here.
     */
    if (isFunction(attributes)) {
      callback = attributes
      attributes = {}
    }

    if (typeof attributes === 'string') {
      attributes = { prefix: attributes }
    }

    if (typeof callback !== 'function') {
      throw new Error('You must provide a callback function when using Route.group()')
    }

    const group = new RouteGroup(attributes)

    /**
     * Keep track of the route group so that routes defined in the callback will
     * use the configured attributes (e.g., prefix, middleware) of the group.
     */
    this.groupStack().push(group)

    /*
     * Process the callback to register routes or nested route groups to the router.
     */
    callback()

    /*
     * Now that the callback is processed, remove this group from the stack.
     */
    this.groupStack().pop()
  }

  /**
   * Assign the given `prefix` to a route path or all routes defined in a route group.
   *
   * @param prefix String
   *
   * @returns PendingRoute
   */
  prefix (prefix: string): PendingRoute {
    return new PendingRoute(this).prefix(prefix)
  }

  /**
   * Assign the given `middleware` stack to a route or all routes defined in a route group.
   *
   * @param middleware String|String[]
   *
   * @returns PendingRoute
   */
  middleware (middleware: string): PendingRoute {
    return new PendingRoute(this).middleware(middleware)
  }

  /**
   * Register a named middleware.
   *
   * @param name string
   * @param Middleware class
   *
   * @returns {Router}
   */
  registerAliasMiddleware (name: string, Middleware: MiddlewareCtor): Router {
    if (Str(name).isEmpty()) {
      throw new Error('Missing route-level middleware name')
    }

    if (isNotConstructor(Middleware)) {
      throw new Error(`You must provide a class constructor for the route-level middleware "${name}"`)
    }

    return tap(this, () => {
      this.meta.middleware.set(name, Middleware)
    })
  }
}
