'use strict'

import { Server } from '@hapi/hapi'
import { BootApplication, HandleExceptions, LoadBootstrappers } from '@supercharge/foundation'
import { HttpKernel as HttpKernelContract, Application, Bootstrapper } from '@supercharge/contracts'

type BootstrapperContstructor = new() => Bootstrapper

export class Kernel implements HttpKernelContract {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * The hapi HTTP server instance.
   */
  private readonly server: Server

  /**
   * The list of bootstrappers.
   */
  protected bootstrappers: BootstrapperContstructor[] = [
    HandleExceptions,
    LoadBootstrappers,
    BootApplication
  ]

  /**
   * Create a new console kernel instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.app = app
    this.server = this.createHttpServer()
  }

  /**
   * Create an HTTP server instance.
   *
   * @returns {Server}
   */
  createHttpServer (): Server {
    return new Server(
      this.app.config().get('server')
    )
  }

  /**
   * Start the HTTP instance listening for incoming requests.
   *
   * @returns {Promise}
   */
  async startServer (): Promise<void> {
    await this.bootstrap()
    await this.server.start()
  }

  /**
   * Bootstrap the console application for Craft commands.
   */
  async bootstrap (): Promise<void> {
    await this.app.bootstrapWith(this.bootstrappers)

    await this.plugins()
    await this.auth()
    await this.middleware()
    await this.routes()
  }

  /**
   * Register authentication strategies to the server.
   */
  async auth (): Promise<void> {
    // TODO
  }

  /**
   * Register HTTP server (hapi) plugins to the server.
   */
  async plugins (): Promise<void> {
    // TODO
  }

  /**
   * Register server and request lifecycle extensions (middleware) to the server.
   */
  async middleware (): Promise<void> {
    // TODO
  }

  /**
   * Register routes to the server.
   */
  async routes (): Promise<void> {
    // TODO
  }
}
