'use strict'

import Koa from 'koa'
import { tap } from '@supercharge/goodies'
import { HttpContext } from './http-context'
import { BodyparserMiddleware } from './middleware'
import { className, isConstructor } from '@supercharge/classes'
import { Application, HttpServer as HttpServerContract, Middleware as MiddlewareContract, MiddlewareCtor, HttpRouter, ErrorHandler, HttpServerHandler, InlineMiddlewareHandler, NextHandler } from '@supercharge/contracts'

export class Server implements HttpServerContract {
  /**
   * The server’s meta data.
   */
  private meta: {
    /**
     * The application instance.
     */
    app: Application

    /**
     * The Koa server instance.
     */
    instance?: Koa

    /**
     * The HTTP router instance.
     */
    router?: HttpRouter

    /**
     * Determine whether the HTTP server bootstrapping ran.
     */
    isBootstrapped: boolean
  }

  /**
   * Create a new HTTP context instance.
   */
  constructor (app: Application) {
    this.meta = { app, isBootstrapped: false }

    this.registerBaseMiddleware()
  }

  /**
   * Register middlware to the HTTP server.
   */
  registerBaseMiddleware (): void {
    this.registerCoreMiddleware()
    this.registerErrorHandler()
  }

  /**
   * Register an exception handler to process and respond for a given error.
   */
  registerErrorHandler (): void {
    this.use(async (ctx: any, next: NextHandler) => {
      try {
        await next()
      } catch (error: any) {
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
    this.coreMiddleware().forEach((Middleware: MiddlewareCtor) => {
      this.use(Middleware)
    })
  }

  /**
   * Returns an array of middleware that will be registered when creating the HTTP server.
   *
   * @returns {MiddlewareCtor[]}
   */
  coreMiddleware (): MiddlewareCtor[] {
    return [
      BodyparserMiddleware
    ]
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
   * Returns a Koa server instance.
   *
   * @returns {Koa}
   */
  createServerInstance (): Koa {
    return new Koa({
      keys: [this.app().key()]
    })
  }

  /**
   * Returns the application instance.
   *
   * @returns {Application}
   */
  app (): Application {
    return this.meta.app
  }

  /**
   * Determine whether the HTTP server is already boostrapped.
   *
   * @returns {Boolean}
   */
  isBootstrapped (): boolean {
    return this.meta.isBootstrapped
  }

  /**
   * Mark this HTTP server as bootstrapped.
   *
   * @returns {this}
   */
  markAsBootstrapped (): this {
    return tap(this, () => {
      this.meta.isBootstrapped = true
    })
  }

  /**
   * Returns the router instance.
   *
   * @returns {HttpRouter}
   */
  router (): HttpRouter {
    if (!this.meta.router) {
      this.meta.router = this.app().make<HttpRouter>('route')
    }

    return this.meta.router
  }

  /**
   * Register a route-level middleware for the given `name` and `Middleware` to the HTTP router.
   */
  useRouteMiddleware (name: string, Middleware: MiddlewareCtor): this {
    return tap(this, () => {
      this.router().registerAliasMiddleware(name, Middleware)
    })
  }

  /**
   * Add the given `Middleware` as a global middleware to the HTTP server.
   */
  use (Middleware: MiddlewareCtor | InlineMiddlewareHandler): this {
    isConstructor<any>(Middleware)
      ? this.bindAndRegisterMiddlewareClass(Middleware)
      : this.registerMiddlewareHandler(Middleware)

    return this
  }

  /**
   * Register the given HTTP middleware to the IoC container and HTTP server instance.
   *
   * @param {MiddlewareCtor} Middleware
   */
  private bindAndRegisterMiddlewareClass (Middleware: MiddlewareCtor): void {
    this.ensureHandleMethod(Middleware)

    this.app().singleton(Middleware, () => {
      return new Middleware(this.app())
    })

    this.instance().use(async (ctx, next) => {
      return this.app().make<MiddlewareContract>(Middleware).handle(
        this.createContext(ctx), next
      )
    })
  }

  /**
   * Ensure that the given `Middleware` implements a `handle` method.
   *
   * @param Middleware
   *
   * @throws
   */
  private ensureHandleMethod (Middleware: MiddlewareCtor): void {
    const middleware = new Middleware(this.app())

    if (typeof middleware.handle === 'function') {
      return
    }

    throw new Error(`The Middleware class ${className(Middleware)} must implement a "handle" method.`)
  }

  /**
   * Register the given HTTP middleware to the IoC container and HTTP server instance.
   *
   * @param {MiddlewareCtor} Middleware
   */
  private registerMiddlewareHandler (handler: InlineMiddlewareHandler): void {
    this.instance().use(async (ctx, next) => {
      return await handler(this.createContext(ctx), next)
    })
  }

  /**
   * Returns a request handler callback compatible with Node.js’ native HTTP server.
   *
   * @returns {HttpServerHandler}
   */
  callback (): HttpServerHandler {
    return this.instance().callback()
  }

  /**
   * Bootstrap the HTTP server.
   */
  async bootstrap (): Promise<void> {
    if (this.isBootstrapped()) {
      return
    }

    this.registerRoutes()
    this.markAsBootstrapped()
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
  private registerRoutes (): void {
    this.instance().use(
      this.router().createRoutingMiddleware()
    )
  }

  /**
   * Start the HTTP server.
   */
  async start (): Promise<void> {
    this.instance().listen(this.port(), this.hostname(), () => {
      this.app().logger().info(`Started the server on http://${this.hostname()}:${this.port()}`)
    })
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
