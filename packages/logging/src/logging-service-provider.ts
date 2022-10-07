'use strict'

import { LogManager } from './log-manager'
import { ServiceProvider } from '@supercharge/support'
import { ServiceProvider as ServiceProviderContract } from '@supercharge/contracts'

export class LoggingServiceProvider extends ServiceProvider implements ServiceProviderContract {
  /**
   * Register the logger into the container.
   */
  override register (): void {
    this.app().singleton('logger', () => {
      const loggingConfig = this.app().config().get('logging')

      return new LogManager(this.app(), loggingConfig)
    })
  }
}
