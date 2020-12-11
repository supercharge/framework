'use strict'

import Koa from 'koa'
import { Class } from 'type-fest'
import bodyParser from 'koa-bodyparser'
import Fs from '@supercharge/filesystem'
import Collect from '@supercharge/collections'
import { esmResolve } from '@supercharge/goodies'
import { Request, Response } from '@supercharge/http'
import { Router } from '@supercharge/routing/dist/src'
import {
  HandleExceptions,
  LoadConfiguration,
  LoadEnvironmentVariables,
  RegisterServiceProviders,
  BootServiceProviders
} from '../bootstrappers'

import { Application, BootstrapperCtor, HttpContext, HttpKernel as HttpKernelContract, MiddlewareCtor } from '@supercharge/contracts'

// type ObjectKeys<T> =
//   T extends object ? Array<keyof T> :
//     T extends number ? [] :
//       T extends any[] | string ? string[] :
//         never

// interface ObjectConstructor {
//   keys: <T>(o: T) => ObjectKeys<T>
// }

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
    this.server = new Koa()
    this.router = this.app().container().make('supercharge/route')

    this.syncMiddlewareToRouter()
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
    // this.syncRouteGroupsToRouter()
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

    this.app().container().bind(this.controllerNamespaceFor(Controller), () => {
      return new Controller(this.app())
    })
  }

  /**
   * Returns the prefixed controller namespace used to bind an instance in the IoC container.
   *
   * @param Controller
   *
   * @returns {String}
   */
  private controllerNamespaceFor (Controller: Class): string {
    return `http/controllers/${Controller.name}`
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
      response: new Response(ctx.response)
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

    console.log(`Started the server on http://${this.hostname()}:${this.port()}`)
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
