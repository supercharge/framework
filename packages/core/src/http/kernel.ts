'use strict'

import Koa from 'koa'
import { Class } from 'type-fest'
import bodyParser from 'koa-bodyparser'
import Fs from '@supercharge/filesystem'
import Collect from '@supercharge/collections'
import { Request, Response } from '@supercharge/http'
import { Router } from '@supercharge/routing/dist/src'
import { esmResolve, tap } from '@supercharge/goodies'
import { Application, BootstrapperCtor, HttpContext, HttpKernel as HttpKernelContract, MiddlewareCtor } from '@supercharge/contracts'
import { HandleExceptions, LoadConfiguration, LoadEnvironmentVariables, RegisterServiceProviders, BootServiceProviders } from '../bootstrappers'

export class HttpKernel implements HttpKernelContract {
  private readonly meta: {
    /**
     * The application instance.
     */
    app: Application
  }

  /**
   * The HTTP server instance.
   */
  private readonly server: Koa

  /**
   * The HTTP server instance.
   */
  private readonly router: Router

  /**
   * Create a new HTTP kernel instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.meta = { app }
    this.server = this.createServer()
    this.router = this.app().make('supercharge/route')

    this.syncMiddlewareToRouter()
  }

  /**
   * Create a Koa server instance.
   *
   * @returns {Koa}
   */
  createServer (): Koa {
    return tap(new Koa(), server => {
      server.keys = [this.app().key()]
    })
  }

  /**
   * Returns the application’s global middleware stack. Every middleware
   * listed here runs on every request to the application.
   *
   * @returns {MiddlewareCtor[]}
   */
  protected middleware (): MiddlewareCtor[] {
    return []
  }

  /**
   * Returns the application’s global middleware stack. Every middleware
   * listed here runs on every request to the application.
   *
   * @returns {MiddlewareCtor[]}
   */
  protected routeMiddleware (): { [key: string]: MiddlewareCtor} {
    return {}
  }

  /**
   * Returns the path to the HTTP controllers.
   *
   * @returns {String}
   */
  protected controllersLocation (): string {
    return this.app().resolveFromBasePath('app/http/controllers')
  }

  /**
   * Sync the available middleware to the router.
   */
  private syncMiddlewareToRouter (): void {
    this.syncRouteMiddlewareToRouter()
  }

  /**
   * Sync the provided route-level middleware to the router.
   */
  private syncRouteMiddlewareToRouter (): void {
    Object
      .entries(this.routeMiddleware())
      .forEach(([key, middleware]) => {
        this.router.registerAliasMiddleware(key, middleware)
      })
  }

  /**
   * Returns the app instance.
   */
  app (): Application {
    return this.meta.app
  }

  /**
   * Start the HTTP instance listening for incoming requests.
   *
   * @returns {Promise}
   */
  async startServer (): Promise<void> {
    await this.bootstrap()
    await this.registerMiddleware()
    await this.registerRoutes()
    await this.listen()
  }

  /**
   * Bootstrap the application by loading environment variables, load the
   * configuration, register service providers into the IoC container
   * and ultimately boot the registered providers.
   */
  async bootstrap (): Promise<void> {
    await this.app().bootstrapWith(
      this.bootstrappers()
    )

    await this.registerHttpControllers()
  }

  /**
   * Returns the list of application bootstrappers.
   */
  protected bootstrappers (): BootstrapperCtor[] {
    return [
      HandleExceptions,
      LoadEnvironmentVariables,
      LoadConfiguration,
      RegisterServiceProviders,
      BootServiceProviders
    ]
  }

  /**
   * Register all available HTTP controllers.
   */
  private async registerHttpControllers (): Promise<void> {
    const controllerPaths = await this.controllerPaths()

    controllerPaths.forEach(controllerPath => {
      this.resolveAndBindController(controllerPath)
    })
  }

  /**
   * Returns an array of file paths to all controllers.
   *
   * @returns {String[]}
   */
  private async controllerPaths (): Promise<string[]> {
    return await Fs.allFiles(
      this.controllersLocation()
    )
  }

  /**
   * Bind the resolved HTTP controller into the container.
   */
  private resolveAndBindController (controllerPath: string): void {
    const Controller: Class = esmResolve(require(controllerPath))

    this.app().bind(Controller.name, () => {
      return new Controller(this.app())
    })
  }

  /**
   * Register middlware to the HTTP server.
   */
  private async registerMiddleware (): Promise<void> {
    await this.registerCoreMiddleware()
    await this.registerAppMiddleware()
  }

  /**
   * Register the core middleware stack. This is basically a global middleware
   * stack, but it’s not configurable by the user. Instead, all middleware
   * registered here will be available out of the box.
   */
  async registerCoreMiddleware (): Promise<void> {
    this.server.use(bodyParser())
  }

  /**
   * Register the global application middleware stack.
   */
  async registerAppMiddleware (): Promise<void> {
    await Collect(
      this.middleware()
    ).forEach(async (Middleware: MiddlewareCtor) => {
      this.server.use(async (ctx, next) => {
        return new Middleware().handle(
          this.createContext(ctx), next
        )
      })
    })
  }

  /**
   * Wrap the given Koa `ctx` into a Supercharge context.
   *
   * @param ctx
   */
  createContext (ctx: any): HttpContext {
    return {
      raw: ctx,
      request: new Request(ctx),
      response: new Response(ctx)
    }
  }

  /**
   * Register routes to the HTTP server.
   */
  private async registerRoutes (): Promise<void> {
    this.server.use(
      this.router.createRoutingMiddleware()
    )
  }

  /**
   * Start the HTTP server.
   */
  private async listen (): Promise<void> {
    await this.server.listen(this.port(), this.hostname())

    this.app().logger().info(`Started the server on http://${this.hostname()}:${this.port()}`)
  }

  /**
   * Returns the local port on which the server listens for connections.
   *
   * @returns {Number}
   */
  port (): number {
    return this.app().config().get('app.port')
  }

  /**
   * Returns the hostname on which the server listens for connections.
   *
   * @returns {String}
   */
  hostname (): string {
    return this.app().config().get('app.host')
  }
}
