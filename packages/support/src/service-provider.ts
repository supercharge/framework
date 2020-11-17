'use strict'

import { Application, ServiceProvider as ServiceProviderContract } from '@supercharge/contracts'

export class ServiceProvider implements ServiceProviderContract {
  /**
   * Stores service provider meta data.
   */
  private readonly meta: {
    app: Application
  }

  /**
   * Create a new service provider instance.
   *
   * @param app
   */
  constructor (app: Application) {
    this.meta = { app }
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
   * Register application services to the container.
   */
  register (): void {
    //
  }

  /**
   * Boot application services.
   */
  async boot (): Promise<void> {
    //
  }
}
