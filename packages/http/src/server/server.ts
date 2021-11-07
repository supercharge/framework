'use strict'

import Koa from 'koa'
import { tap } from '@supercharge/goodies'
import { HttpContext } from './http-context'
import Collect from '@supercharge/collections'
import { Server as NodeHttpServer } from 'http'
import { BodyparserMiddleware } from './middleware'
import { className, isConstructor } from '@supercharge/classes'
import { Application, HttpServer as HttpServerContract, Middleware as MiddlewareContract, MiddlewareCtor, HttpRouter, ErrorHandler, HttpServerHandler, InlineMiddlewareHandler, NextHandler } from '@supercharge/contracts'

type Callback = (server: Server) => unknown | Promise<unknown>

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
    koa: Koa

    /**
     * The started HTTP server instance
     */
    server?: NodeHttpServer

    /**
     * The HTTP router instance.
     */
    router?: HttpRouter

    /**
     * Determine whether the HTTP server bootstrapping ran.
     */
    isBootstrapped: boolean

    /**
     * Stores the "booted" callbacks
     */
    bootedCallbacks: Callback[]
  }

  /**
   * Create a new HTTP context instance.
   */
  constructor (app: Application) {
    this.meta = {
      app,
      bootedCallbacks: [],
      isBootstrapped: false,
      koa: new Koa({ keys: [app.key()] })
    }

    this.registerBaseMiddleware()
  }

  /**
   * Register middlware to the HTTP server.
   */
  registerBaseMiddleware (): void {
    this.registerErrorHandler()
    this.registerCoreMiddleware()
  }

  /**
   * Register an exception handler to process and respond for a given error.
   */
  registerErrorHandler (): void {
    this.use(async (ctx: any, next: NextHandler) => {
      try {
        await next()
      } catch (error: any) {
        await this.handleErrorFor(ctx, error)
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
   * Returns the Koa application instance.
   *
   * @returns {Koa}
   */
  koa (): Koa {
    return this.meta.koa
  }

  /**
   * Returns the HTTP server instance. Returns `undefined ` if the Koa server wasn’t started.
   *
   * @returns {NodeHttpServer | undefined}
   */
  private startedServer (): NodeHttpServer | undefined {
    return this.meta.server
  }

  /**
   * Register a booted callback that runs after the HTTP server started.
   *
   * @returns {this}
   */
  booted (callback: Callback): this {
    return tap(this, () => {
      this.bootedCallbacks().push(callback)
    })
  }

  /**
   * Returns the booted callbacks.
   *
   * @returns {Callback[]}
   */
  private bootedCallbacks (): Callback[] {
    return this.meta.bootedCallbacks
  }

  /**
   * Run the configured `booted` callbacks.
   */
  protected async runBootedCallbacks (): Promise<void> {
    await this.runCallbacks(
      this.bootedCallbacks()
    )
  }

  /**
   * Call the given kernal `callbacks`.
   *
   * @param {Callback[]} callbacks
   */
  protected async runCallbacks (callbacks: Callback[]): Promise<void> {
    await Collect(callbacks).forEach(async callback => {
      // eslint-disable-next-line node/no-callback-literal
      await callback(this)
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

    this.koa().use(async (ctx, next) => {
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
    this.koa().use(async (ctx, next) => {
      return await handler(this.createContext(ctx), next)
    })
  }

  /**
   * Returns a request handler callback compatible with Node.js’ native HTTP server.
   *
   * @returns {HttpServerHandler}
   */
  callback (): HttpServerHandler {
    this.bootstrap()

    return this.koa().callback()
  }

  /**
   * Bootstrap the HTTP server.
   */
  bootstrap (): void {
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
    this.koa().use(
      this.router().createRoutingMiddleware()
    )
  }

  /**
   * Start the HTTP server.
   */
  async start (): Promise<void> {
    await new Promise<void>(resolve => {
      this.meta.server = this.koa().listen(this.port(), this.hostname(), () => {
        this.app().logger().info(`Started the server on http://${this.hostname()}:${this.port()}`)

        resolve()
      })
    })

    await this.runBootedCallbacks()
  }

  /**
   * Stop the HTTP server from accepting new connections. Existing connections
   * stay alive and will be processed. The server stops as soon as all open
   * connections have been processed through the HTTP request lifecycle.
   */
  async stop (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.startedServer()?.close(error => {
        return error
          ? reject(error)
          : resolve()
      })
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
