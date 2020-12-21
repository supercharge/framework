'use strict'

import Fs from '@supercharge/filesystem'
import { Server } from '@supercharge/http'
import { Application, BootstrapperCtor, HttpKernel as HttpKernelContract, MiddlewareCtor } from '@supercharge/contracts'
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
  private readonly server: Server

  /**
   * Create a new HTTP kernel instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.meta = { app }
    this.server = new Server(this)
  }

  /**
   * Returns the application’s global middleware stack. Every middleware
   * listed here runs on every request to the application.
   *
   * @returns {MiddlewareCtor[]}
   */
  middleware (): MiddlewareCtor[] {
    return []
  }

  /**
   * Returns the application’s global middleware stack. Every middleware
   * listed here runs on every request to the application.
   *
   * @returns {MiddlewareCtor[]}
   */
  routeMiddleware (): { [key: string]: MiddlewareCtor} {
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

    await this.server.bootstrap()
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
   * Returns an array of file paths to all controllers.
   *
   * @returns {String[]}
   */
  async controllerPaths (): Promise<string[]> {
    return await Fs.allFiles(
      this.controllersLocation()
    )
  }

  /**
   * Start the HTTP server.
   */
  private async listen (): Promise<void> {
    await this.server.start()
  }
}
