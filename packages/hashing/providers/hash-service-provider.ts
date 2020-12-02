'use strict'

import { ServiceProvider } from '@supercharge/support'

export class HashServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   *
   * @param {Application} app - the application instance
   */
  register (): void {
    this.app().container().bind('supercharge/hash', () => {
      const { HashManager } = require('../src/hash-manager')

      return new HashManager(this.app())
    })
  }
}
