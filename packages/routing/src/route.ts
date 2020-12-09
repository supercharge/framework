'use strict'

import Str from '@supercharge/strings'
import { tap } from '@supercharge/goodies'
import { HttpRoute, RouteHandler, HttpMethod, HttpContext } from '@supercharge/contracts'

interface RouteAttributes {
  path: string
  methods: HttpMethod[]
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
  constructor (methods: HttpMethod[], path: string, handler: RouteHandler) {
    this.attributes = { methods, path, handler, middleware: [] }
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
   * Returns the HTTP methods.
   *
   * @returns string
   */
  public methods (): HttpMethod[] {
    return this.attributes.methods
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
  middleware (middleware?: string|string[]): this {
    return tap(this, () => {
      if (middleware) {
        this.attributes.middleware = this.attributes.middleware.concat(middleware)
      }
    })
  }

  /**
   * Returns the middleware stack for this route.
   *
   * @returns {string[]}
   */
  getMiddleware (): string[] {
    return this.attributes.middleware
  }

  /**
   * Run the route handler.
   *
   * @param ctx HttpContext
   */
  async run (ctx: HttpContext): Promise<void> {
    await this.handler()(ctx)
  }
}
