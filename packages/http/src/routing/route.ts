
import { Str } from '@supercharge/strings'
import { tap } from '@supercharge/goodies'
import { isClass } from '@supercharge/classes'
import { HttpRoute, HttpController, RouteHandler, HttpMethods, HttpContext, Application, Class, RouteObjectAttributes } from '@supercharge/contracts'

interface RouteAttributes {
  path: string
  methods: HttpMethods[]
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
   * Create a new route instance.
   */
  constructor (methods: HttpMethods[], path: string, handler: RouteHandler, app: Application) {
    this.app = app
    this.attributes = { methods, path, handler, middleware: [] }
  }

  /**
   * Returns the route path.
   */
  path (): string {
    return Str(this.attributes.path).trim('/').start('/').get()
  }

  /**
   * Returns the HTTP methods.
   */
  methods (): HttpMethods[] {
    return this.attributes.methods
  }

  /**
   * Returns the route handler.
   */
  handler (): RouteHandler {
    return this.attributes.handler
  }

  /**
   * Assign the given `prefix` to this route.
   */
  prefix (prefix: string): this {
    return tap(this, () => {
      this.attributes.path = Str(prefix).concat(this.path()).get()
    })
  }

  /**
   * Assign the given `middleware` stack to this route.
   */
  middleware (middleware?: string | string[]): this {
    return tap(this, () => {
      if (middleware) {
        this.attributes.middleware = this.attributes.middleware.concat(middleware)
      }
    })
  }

  /**
   * Returns the middleware stack for this route.
   */
  getMiddleware (): string[] {
    return this.attributes.middleware
  }

  /**
   * Run the route handler.
   */
  async run (ctx: HttpContext): Promise<any> {
    if (this.isControllerClass()) {
      return await this.runControllerClass(ctx)
    }

    if (this.isInlineHandler()) {
      return await this.runCallable(ctx)
    }

    throw new Error('Invalid route handler. Only controller actions and inline handlers are allowed')
  }

  /**
   * Determine whether the assigned handler is a controller constructor.
   */
  isControllerClass (): boolean {
    return isClass(this.handler())
  }

  /**
   * Resolve the route controller instance and run
   * the `handle` method for the given HTTP `ctx`.
   */
  async runControllerClass (ctx: HttpContext): Promise<void> {
    const instance = this.app.make<HttpController>(
      this.handler() as Class<HttpController>
    )

    if (typeof instance.handle !== 'function') {
      throw new Error(`You must implement the "handle" method in controller "${String(instance.constructor.name)}"`)
    }

    return await instance.handle(ctx)
  }

  /**
   * Determine whether the assigned handler for this route is a controller action.
   */
  isInlineHandler (): boolean {
    return typeof this.handler() === 'function'
  }

  /**
   * Run the route handler
   */
  async runCallable (ctx: HttpContext): Promise<void> {
    return await (this.handler() as Function)(ctx)
  }

  /**
   * Returns the route object’s attributes.
   */
  toJSON (): RouteObjectAttributes {
    return {
      path: this.path(),
      methods: this.methods(),
      middleware: this.getMiddleware(),
      isInlineHandler: this.isInlineHandler(),
      isControllerClass: this.isControllerClass(),
    }
  }
}
