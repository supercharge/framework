'use strict'

import { Route } from './route'
import { Router } from './router'
import Str from '@supercharge/strings'
import { tap } from '@supercharge/goodies'
import { PendingRoute as PendingRouteContract, RouteHandler, RouteAttributes } from '@supercharge/contracts'

export class PendingRoute implements PendingRouteContract {
  /**
   * The router instance.
   */
  private readonly router: Router

  /**
   * Stores attributes (prefix, middleware, etc.) for a route or route group.
   */
  private readonly attributes: Required<RouteAttributes>

  /**
   * Create a new pending route instance.
   *
   * @param router Router
   */
  constructor (router: Router) {
    this.router = router
    this.attributes = { prefix: '', middleware: [] }
  }

  /**
   * Assign the given `prefix` to a route path or all routes defined in a route group.
   *
   * @param prefix String
   *
   * @returns PendingRoute
   */
  prefix (prefix: string): PendingRoute {
    return tap(this, () => {
      this.attributes.prefix = Str(prefix).start('/').get()
    })
  }

  /**
   * Assign the given `middleware` stack to a route or all routes defined in a route group.
   *
   * @param middleware String|String[]
   *
   * @returns PendingRoute
   */
  middleware (middleware: string | string[]): PendingRoute {
    return tap(this, () => {
      this.attributes.middleware = this.attributes.middleware.concat(middleware)
    })
  }

  /**
   * Create a new route group.
   *
   * @param callback Function
   */
  group (callback: () => void): void {
    return this.router.group(this.attributes, callback)
  }

  /**
   * Returns the route path with a possibly available prefix.
   *
   * @param path
   */
  private createPathFor (path: string): string {
    return Str(this.attributes.prefix).concat(path).get()
  }

  /**
   * Returns the configured route-level middleware stack.
   *
   * @returns {String[]}
   */
  private getMiddleware (): string[] | undefined {
    return this.attributes.middleware
  }

  /**
   * Create a GET route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  get (path: string, handler: RouteHandler): Route {
    return this.router.get(this.createPathFor(path), handler, this.getMiddleware())
  }

  /**
   * Create a POST route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  post (path: string, handler: RouteHandler): Route {
    return this.router.post(this.createPathFor(path), handler, this.getMiddleware())
  }

  /**
   * Create a PUT route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  put (path: string, handler: RouteHandler): Route {
    return this.router.put(this.createPathFor(path), handler, this.getMiddleware())
  }

  /**
   * Create a DELETE route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  delete (path: string, handler: RouteHandler): Route {
    return this.router.delete(this.createPathFor(path), handler, this.getMiddleware())
  }

  /**
   * Create a PATCH route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  patch (path: string, handler: RouteHandler): Route {
    return this.router.patch(this.createPathFor(path), handler, this.getMiddleware())
  }

  /**
   * Create an OPTIONS route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  options (path: string, handler: RouteHandler): Route {
    return this.router.options(this.createPathFor(path), handler)
  }
}
