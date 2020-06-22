'use strict'

import { Server } from '@hapi/hapi'
import Fs from '@supercharge/filesystem'
import Collect from '@supercharge/collections'
import { CollectionProxy } from '@supercharge/collections/dist/collection-proxy'
import { BootApplication, HandleExceptions, LoadBootstrappers } from '@supercharge/foundation'
import { HttpKernel as HttpKernelContract, Application, BootstrapperContstructor } from '@supercharge/contracts'

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
      this.app.config().get('server', {})
    )
  }

  /**
   * Returns the absolute path to the app plugins directory.
   *
   * @returns {String}
   */
  pluginsDirectory (): string {
    return ''
  }

  /**
   * Returns the absolute path to the app middlware directory.
   *
   * @returns {String}
   */
  middlewareDirectory (): string {
    return ''
  }

  /**
   * Returns the absolute path to the app routes directory.
   *
   * @returns {String}
   */
  routesDirectory (): string {
    return ''
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
    await this.middleware()
    await this.routes()
  }

  /**
   * Register plugins to the HTTP server.
   */
  async plugins (): Promise<void> {
    await this.registerBasePlugins()
    await this.registerAppPlugins()
  }

  /**
   * Register the base plugins extending the HTTP request
   * and response instances with useful helper methods.
   */
  private async registerBasePlugins (): Promise<void> {
    await this.server.register([
      require('hapi-request-utilities'),
      require('hapi-response-utilities'),
      require('hapi-class-extension-points')
    ])
  }

  /**
   * Register all HTTP plugins in the application.
   */
  private async registerAppPlugins (): Promise<void> {
    await Collect(
      await this.loadAndResolveFilesFrom(this.pluginsDirectory())
    ).forEach(async (plugin: any) => {
      await this.server.register(plugin)
    })
  }

  /**
   * Register server and request lifecycle extensions (middleware) to the server.
   */
  async middleware (): Promise<void> {
    await Collect(
      await this.loadAndResolveFilesFrom(this.middlewareDirectory())
    ).forEach(async (middleware: any) => {
      // TODO remove the line below
      // @ts-ignore
      await this.server.extClass(middleware)
    })
  }

  /**
   * Register routes to the server.
   */
  async routes (): Promise<void> {
    await Collect(
      await this.loadAndResolveFilesFrom(this.routesDirectory())
    ).forEach(async (route: any) => {
      await this.server.route(route)
    })
  }

  /**
   * Load recursively all files from the given `directory`.
   *
   * @param {String} directory
   */
  private async loadFilesFrom (directory: string = ''): Promise<string[]> {
    if (!directory) {
      return []
    }

    return await Fs.exists(directory)
      ? Fs.allFiles(directory)
      : []
  }

  /**
   * Require and return the result of the given `path`.
   *
   * @param {String} path
   *
   * @returns {*}
   */
  private resolve (path: string) {
    return require(path)
  }

  /**
   * Returns a collection instance of the loaded files in the given `directory`.
   *
   * @param {String} directory
   *
   * @returns {CollectionProxy}
   */
  private async loadAndResolveFilesFrom (directory: string = ''): Promise<CollectionProxy> {
    return Collect(
      await this.loadFilesFrom(directory)
    ).map((file: string) => {
      return this.resolve(file)
    })
  }
}
