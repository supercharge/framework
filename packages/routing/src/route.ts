'use strict'

import Str from '@supercharge/strings'
import { tap, isNullish } from '@supercharge/goodies'
import { HttpRoute, RouteHandler, HttpMethod, HttpContext, Application } from '@supercharge/contracts'

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
   * Stores the app instance.
   */
  private readonly app: Application

  /**
   * The route’s contorller.
   */
  private controller: any

  /**
   * Create a new route instance.
   *
   * @param method string
   * @param path string
   * @param handler RouteHandler
   */
  constructor (methods: HttpMethod[], path: string, handler: RouteHandler, app: Application) {
    this.app = app
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
    if (this.isInlineHandler()) {
      return this.runCallable(ctx)
    }

    if (this.isControllerAction()) {
      return this.runController(ctx)
    }

    throw new Error('Invalid route handler. Only controller actions and inline handlers are allowed')
  }

  /**
   * Determine whether the assigned handler for this route is a controller action.
   *
   * @returns {Boolean}
   */
  isInlineHandler (): boolean {
    return typeof this.handler() === 'function'
  }

  /**
   * Run the route handler
   *
   * @param ctx HttpContext
   */
  async runCallable (ctx: HttpContext): Promise<void> {
    await (this.handler() as Function)(ctx)
  }

  /**
   * Determine whether the assigned handler for this route is a controller action.
   *
   * @returns {Boolean}
   */
  isControllerAction (): boolean {
    return typeof this.handler() === 'string'
  }

  /**
   * Resolve and run the route controller method.
   *
   * @param ctx HttpContext
   */
  async runController (ctx: HttpContext): Promise<void> {
    const method = this.getControllerMethod()

    if (isNullish(method)) {
      throw new Error(`Missing controller method for route ${this.methods().toString()} ${this.path()}`)
    }

    return this.getController()[method as string](ctx)
  }

  /**
   * Returns the controller for this route.
   *
   * @returns {*}
   */
  getController (): any {
    if (!this.controller) {
      this.controller = this.app.make(this.getControllerName())
    }

    return this.controller
  }

  /**
   * Returns the controller name.
   *
   * @returns {String}
   */
  getControllerName (): string {
    return this.parseControllerCallback()[0]
  }

  /**
   * Returns the controller method.
   *
   * @returns {String}
   */
  getControllerMethod (): string | undefined {
    return this.parseControllerCallback()[1]
  }

  /**
   * Returns the parsed controller.
   *
   * @returns {String[]}
   */
  parseControllerCallback (): [ string, string | undefined] {
    return Str(this.handler() as string).parseCallback('.')
  }
}
