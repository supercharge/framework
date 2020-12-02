'use strict'

import { Router } from './router'
import Str from '@supercharge/strings'
import { tap } from '@supercharge/goodies'
import { RouteAttributes } from './route-attributes'
import { PendingRoute as PendingRouteContract, RouteHandler } from '@supercharge/contracts'

export class PendingRoute implements PendingRouteContract {
  /**
   * The router instance.
   */
  private readonly router: Router

  /**
   * Stores attributes (prefix, middleware, etc.) for a route or route group.
   */
  private readonly attributes: RouteAttributes

  /**
   * Create a new pending route instance.
   *
   * @param router Router
   */
  constructor (router: Router) {
    this.router = router
    this.attributes = new RouteAttributes()
  }

  /**
   * Assign the given `prefix` to a route path or all routes defined in a route group.
   *
   * @param prefix String
   *
   * @returns PendingRoute
   */
  public prefix (prefix: string): PendingRoute {
    return tap(this, () => {
      this.attributes.setPrefix(
        Str(prefix).start('/').get()
      )
    })
  }

  /**
   * Assign the given `middleware` stack to a route or all routes defined in a route group.
   *
   * @param middleware String|String[]
   *
   * @returns PendingRoute
   */
  public middleware (middleware: string | string[]): PendingRoute {
    return tap(this, () => {
      this.attributes.setMiddleware(middleware)
    })
  }

  /**
   * Create a new route group.
   *
   * @param callback Function
   */
  public group (callback: () => void): void {
    this.router.group(callback, this.attributes)
  }

  /**
   * Returns the route path with a possibly available prefix.
   *
   * @param path
   */
  private createPathFor (path: string): string {
    return Str(
      this.attributes.prefix()
    ).concat(path).get()
  }

  /**
   * Create a GET route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  get (path: string, handler: RouteHandler): void {
    this.router.get(this.createPathFor(path), handler)
  }

  /**
   * Create a POST route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  post (path: string, handler: RouteHandler): void {
    this.router.post(path, handler)
  }

  /**
   * Create a PUT route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  put (path: string, handler: RouteHandler): void {
    this.router.put(path, handler)
  }

  /**
   * Create a DELETE route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  delete (path: string, handler: RouteHandler): void {
    this.router.delete(path, handler)
  }

  /**
   * Create a PATCH route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  patch (path: string, handler: RouteHandler): void {
    this.router.patch(path, handler)
  }

  /**
   * Create an OPTIONS route.
   *
   * @param path String
   * @param handler RouteHandler
   */
  options (path: string, handler: RouteHandler): void {
    this.router.options(path, handler)
  }
}
