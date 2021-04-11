'use strict'

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { HttpContext } from './http-context'
import { esmRequire, tap } from '@supercharge/goodies'
import { Application, Class, HttpKernel, MiddlewareCtor, HttpRouter, ErrorHandler } from '@supercharge/contracts'

export class Server {
  /**
   * The server’s meta data.
   */
  private meta: ServerMeta

  /**
   * Create a new HTTP context instance.
   */
  constructor (kernel: HttpKernel) {
    this.meta = { kernel }
  }

  /**
   * Returns the HTTP server instance.
   *
   * @returns {HttpRouter}
   */
  instance (): Koa {
    if (!this.meta.instance) {
      this.meta.instance = this.createServerInstance()
    }

    return this.meta.instance
  }

  /**
   * Returns the HTTP kernel instance.
   *
   * @returns {HttpKernel}
   */
  kernel (): HttpKernel {
    return this.meta.kernel
  }

  /**
   * Returns the app instance.
   *
   * @returns {Application}
   */
  app (): Application {
    return this.kernel().app()
  }

  /**
   * Returns the router instance.
   *
   * @returns {HttpRouter}
   */
  router (): HttpRouter {
    if (this.meta.router) {
      return this.meta.router
    }

    const router = this.app().make<HttpRouter>('route')

    return tap(router, () => {
      this.meta.router = router
    })
  }

  /**
   * Bootstrap the HTTP server.
   */
  async bootstrap (): Promise<void> {
    this.createServerInstance()
    this.syncMiddlewareToRouter()

    await this.registerMiddleware()
    await this.registerRoutes()
    await this.registerHttpControllers()
  }

  /**
   * Create a Koa server instance.
   *
   * @returns {Koa}
   */
  createServerInstance (): Koa {
    return tap(new Koa(), server => {
      server.keys = [this.app().key()]
    })
  }

  /**
   * Sync the available middleware to the router.
   */
  syncMiddlewareToRouter (): void {
    this.syncRouteMiddlewareToRouter()
  }

  /**
   * Sync the provided route-level middleware to the router.
   */
  syncRouteMiddlewareToRouter (): void {
    Object.entries(
      this.kernel().routeMiddleware()
    ).forEach(([name, middleware]) => {
      this.router().registerAliasMiddleware(name, middleware)
    })
  }

  /**
   * Register middlware to the HTTP server.
   */
  registerMiddleware (): void {
    this.registerErrorHandler()
    this.registerCoreMiddleware()
    this.registerAppMiddleware()
  }

  /**
   * Register an exception handler to process and respond for a given error.
   */
  registerErrorHandler (): void {
    this.instance().use(async (ctx, next) => {
      try {
        await next()
      } catch (error) {
        await this.handleErrorFor(this.createContext(ctx), error)
      }
    })
  }

  /**
   * Process the given `error` and HTTP `ctx` using the error handler.
   *
   * @param error
   * @param ctx
   */
  private async handleErrorFor (ctx: HttpContext, error: Error): Promise<void> {
    await this.app().make<ErrorHandler>('error.handler').handle(ctx, error)
  }

  /**
   * Register the core middleware stack. This is basically a global middleware
   * stack, but it’s not configurable by the user. Instead, all middleware
   * registered here will be available out of the box.
   */
  registerCoreMiddleware (): void {
    this.instance().use(bodyParser())
  }

  /**
   * Register the global application middleware stack.
   */
  registerAppMiddleware (): void {
    this.kernel().middleware().forEach((Middleware: MiddlewareCtor) => {
      this.bindAndRegisterMiddleware(Middleware)
    })
  }

  /**
   * Register the given HTTP middleware to the IoC container and HTTP server instance.
   *
   * @param {MiddlewareCtor} Middleware
   */
  private bindAndRegisterMiddleware (Middleware: MiddlewareCtor): void {
    this.app().singleton(Middleware.name, () => {
      return new Middleware(this.app())
    })

    this.instance().use(async (ctx, next) => {
      return this.app().make(Middleware).handle(
        this.createContext(ctx), next
      )
    })
  }

  /**
   * Wrap the given Koa `ctx` into a Supercharge context.
   *
   * @param ctx
   */
  private createContext (ctx: any): HttpContext {
    return HttpContext.wrap(ctx, this.app())
  }

  /**
   * Register routes to the HTTP server.
   */
  private async registerRoutes (): Promise<void> {
    this.instance().use(
      this.router().createRoutingMiddleware()
    )
  }

  /**
   * Register all available HTTP controllers.
   */
  private async registerHttpControllers (): Promise<void> {
    const controllerPaths = await this.kernel().controllerPaths()

    controllerPaths.forEach(controllerPath => {
      this.resolveAndBindController(controllerPath)
    })
  }

  /**
   * Bind the resolved HTTP controller into the container.
   */
  private resolveAndBindController (controllerPath: string): void {
    const Controller: Class = esmRequire(controllerPath)

    this.app().bind(Controller.name, () => {
      return new Controller(this.app())
    })
  }

  /**
   * Start the HTTP server.
   */
  async start (): Promise<void> {
    await this.instance().listen(this.port(), this.hostname())

    this.app().logger().info(`Started the server on http://${this.hostname()}:${this.port()}`)
  }

  /**
   * Returns the local port on which the server listens for connections.
   *
   * @returns {Number}
   */
  private port (): number {
    return this.app().config().get('http.port')
  }

  /**
   * Returns the hostname on which the server listens for connections.
   *
   * @returns {String}
   */
  private hostname (): string {
    return this.app().config().get('http.host')
  }
}

interface ServerMeta {
  /**
   * The HTTP kernel instance.
   */
  kernel: HttpKernel

  /**
   * The Koa server instance.
   */
  instance?: Koa

  /**
   * The HTTP router instance.
   */
  router?: HttpRouter
}
