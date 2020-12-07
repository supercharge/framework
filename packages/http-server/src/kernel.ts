'use strict'

import Koa from 'koa'
import Glob from 'globby'
import { Router } from './router'
import KoaRouter from '@koa/router'
import { Request } from './request'
import { Response } from './response'
import bodyParser from 'koa-bodyparser'
import {
  HandleExceptions,
  LoadConfiguration,
  LoadEnvironmentVariables,
  RegisterServiceProviders,
  BootServiceProviders
} from '@supercharge/core/dist/src'
import Collect from '@supercharge/collections'
import { Application, BootstrapperCtor, HttpKernel as HttpKernelContract, MiddlewareCtor } from '@supercharge/contracts'

export class HttpKernel implements HttpKernelContract {
  private readonly meta: {
    /**
     * The application instance.
     */
    app: Application

    /**
     * The HTTP server instance.
     */
    server: Koa

    /**
     * The HTTP router instance.
     */
    router: Router
  }

  /**
   * Create a new console kernel instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.meta = { app, server: new Koa(), router: new Router() }
  }

  /**
   * Returns the app instance.
   */
  app (): Application {
    return this.meta.app
  }

  /**
   * Returns the local port on which the server listens for connections.
   *
   * @returns {}
   */
  port (): number {
    return this.app().config().get('app.port')
  }

  /**
   * Returns the hostname on which the server listens for connections.
   *
   * @returns {}
   */
  hostname (): string {
    return this.app().config().get('app.host')
  }

  /**
   * Returns the HTTP server instance.
   */
  server (): Koa {
    return this.meta.server
  }

  /**
   * Returns the HTTP router instance.
   */
  router (): Router {
    return this.meta.router
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
   * Bootstrap the application by loading environment variables, load the
   * configuration, register service providers into the IoC container
   * and ultimately boot the registered providers.
   */
  async bootstrap (): Promise<void> {
    await this.app().bootstrapWith(
      this.bootstrappers()
    )
  }

  loadRoutesFrom (_: string): string {
    return ''
  }

  /**
   * Register the HTTP bindings into the container.
   */
  registerBindings (): void {
    this.app().container().bind('supercharge/route', () => {
      return this.router()
    })
  }

  /**
   * Register routes to the HTTP server.
   */
  private async registerRoutes (): Promise<void> {
    ([] as string[]).concat(
      await Glob(this.loadRoutesFrom(''))
    ).forEach(file => {
      require(file)
    })

    const koaRouter = new KoaRouter()

    this.router().routes().all().forEach(route => {
      koaRouter.register(route.path(), route.methods(), [
        // TODO: register route-level middleware here
        // async (ctx: any, next: Function) => {
        //   await next()
        // },

        async (ctx: any, next: Function) => {
          await route.handler()({
            raw: ctx,
            request: new Request(ctx),
            response: new Response(ctx.response)
          })

          await next()
        }
      ], { name: route.path() })
    })

    this.server().use(koaRouter.routes())
  }

  /**
   * Register middlware to the HTTP server.
   */
  private async registerMiddleware (): Promise<void> {
    await this.registerCoreMiddleware()
    await this.registerAppMiddleware()
  }

  /**
   * Register the core middleware stack. This is basically global middleware
   * stack, but it’s not configurable by the user. Instead, the provided
   * functionality will be available out of the box.
   */
  async registerCoreMiddleware (): Promise<void> {
    this.server().use(bodyParser())
  }

  /**
   * Register the global application middleware stack.
   */
  async registerAppMiddleware (): Promise<void> {
    await Collect(
      this.middleware()
    ).forEach(async (Middleware: MiddlewareCtor) => {
      this.server().use(async (ctx, next) => {
        return new Middleware().handle({
          raw: ctx,
          request: new Request(ctx),
          response: new Response(ctx.response)
        }, next)
      })
    })
  }

  /**
   * Start the HTTP instance listening for incoming requests.
   *
   * @returns {Promise}
   */
  async startServer (): Promise<void> {
    this.registerBindings()

    await this.bootstrap()
    await this.registerMiddleware()
    await this.registerRoutes()
    await this.listen()
  }

  /**
   * Start the HTTP server.
   */
  private async listen (): Promise<void> {
    await this.server().listen(this.port(), this.hostname())

    console.log(`Started the server on http://${this.hostname()}:${this.port()}`)
  }
}
