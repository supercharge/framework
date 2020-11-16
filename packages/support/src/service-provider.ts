'use strict'

import { Application } from '@supercharge/contracts'

export class ServiceProvider {
  /**
   * Stores service provider meta data.
   */
  private readonly meta: ServiceProviderMeta

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
  protected app (): Application {
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

interface ServiceProviderMeta {
  app: Application
}
