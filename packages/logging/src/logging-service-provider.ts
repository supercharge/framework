'use strict'

import { LogManager } from './log-manager'
import { ServiceProvider } from '@supercharge/support'
import { ServiceProvider as ServiceProviderContract } from '@supercharge/contracts'

export class LoggingServiceProvider extends ServiceProvider implements ServiceProviderContract {
  /**
   * Register the logger into the container.
   */
  register (): void {
    this.app().singleton('supercharge/logger', () => {
      return new LogManager(this.app())
    })
  }
}
