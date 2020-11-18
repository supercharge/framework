'use strict'

import { LoadConfiguration, LoadEnvironmentVariables, HandleExceptions } from '../bootstrappers'
import { Application, BootstrapperCtor, HttpKernel as HttpKernelContract, Middleware } from '@supercharge/contracts'
import { BootServiceProviders } from '../bootstrappers/boot-service-providers'
import { RegisterServiceProviders } from '../bootstrappers/register-service-providers'

export class HttpKernel implements HttpKernelContract {
  private readonly meta: {
    /**
     * The application instance.
     */
    app: Application

    /**
     * The HTTP server instance.
     */
    server?: any // TODO
  }

  /**
   * Create a new console kernel instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.meta = { app }
  }

  /**
   * Returns the app instance.
   */
  app (): Application {
    return this.meta.app
  }

  /**
   * Returns the HTTP server instance.
   */
  server (): any {
    return this.meta.server
  }

  /**
   * Returns the application’s middleware stack. Every middleware runs on
   * every request to the application.
   */
  protected middleware (): Middleware[] {
    return []
  }

  /**
   * Returns the list of application bootstrappers.
   */
  protected bootstrappers (): BootstrapperCtor[] {
    return [
      LoadEnvironmentVariables,
      LoadConfiguration,
      HandleExceptions,
      RegisterServiceProviders,
      BootServiceProviders
    ]
  }

  /**
   * Start the HTTP instance listening for incoming requests.
   *
   * @returns {Promise}
   */
  async startServer (): Promise<void> {
    await this.bootstrap()
    await this.server().start()
  }

  /**
   * Bootstrap the console application for Craft commands.
   */
  async bootstrap (): Promise<void> {
    await this.app().bootstrapWith(
      this.bootstrappers()
    )
  }
}
