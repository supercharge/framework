
import { LogManager } from './log-manager.js'
import { ServiceProvider } from '@supercharge/support'
import type { LoggingConfig, ServiceProvider as ServiceProviderContract } from '@supercharge/contracts'

export class LoggingServiceProvider extends ServiceProvider implements ServiceProviderContract {
  /**
   * Register the logger into the container.
   */
  override register (): void {
    this.app().singleton('logger', () => {
      const loggingConfig = this.app().config().get<LoggingConfig>('logging', { driver: 'console', channels: {} })

      return new LogManager(this.app(), loggingConfig)
    })
  }
}
