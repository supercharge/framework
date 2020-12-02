'use strict'

import Str from '@supercharge/strings'
import { tap } from '@supercharge/goodies'
import { HttpRoute, RouteHandler } from '@supercharge/contracts'

export type HttpMethod = 'get' | 'head' | 'post' | 'put' | 'delete' | 'patch' | 'options'

interface RouteAttributes {
  path: string
  method: HttpMethod
  handler: RouteHandler
  middleware: string[]
}

export class Route implements HttpRoute {
  /**
   * Stores the route attributes
   */
  private readonly attributes: RouteAttributes

  /**
   * Create a new route instance.
   *
   * @param method string
   * @param path string
   * @param handler RouteHandler
   */
  constructor (method: HttpMethod, path: string, handler: RouteHandler) {
    this.attributes = { method, path, handler, middleware: [] }
  }

  /**
   * Returns the route path.
   *
   * @returns string
   */
  public path (): string {
    return Str(this.attributes.path).rtrim('/').get()
  }

  /**
   * Returns the HTTP method.
   *
   * @returns string
   */
  public method (): HttpMethod {
    return this.attributes.method
  }

  /**
   * Returns the route handler.
   *
   * @returns string
   */
  public handler (): RouteHandler {
    return this.attributes.handler
  }

  /**
   * Assign the given `prefix` to this route.
   *
   * @param prefix String
   *
   * @returns PendingRoute
   */
  prefix (prefix: string): this {
    return tap(this, () => {
      this.attributes.path = Str(prefix).concat(this.path()).get()
    })
  }

  /**
   * Assign the given `middleware` stack to this route.
   *
   * @param middleware String|String[]
   *
   * @returns PendingRoute
   */
  middleware (middleware: string | string[]): this {
    return tap(this, () => {
      this.attributes.middleware = this.attributes.middleware.concat(middleware)
    })
  }
}
