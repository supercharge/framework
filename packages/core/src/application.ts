'use strict'

import { HttpServiceProvider } from '@supercharge/http'
import { Application as BaseApplication } from '@supercharge/application'

export class Application extends BaseApplication {
  /**
   * Create a new application instance.
   *
   * @param basePath - the application root path
   */
  constructor (basePath: string) {
    super(basePath)

    this.registerCoreServiceProviders()
  }

  /**
   * Register the base service provider into the container.
   */
  private registerCoreServiceProviders (): void {
    this
      .register(new HttpServiceProvider(this))
  }
}
