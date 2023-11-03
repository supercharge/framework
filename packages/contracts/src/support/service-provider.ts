
import { Application } from '../index.js'

export type ServiceProviderCtor =
  /**
   * Create a new service provider instance.
   */
  new(app: Application) => ServiceProvider

export interface ServiceProvider {
  /**
   * Returns the application instance.
   */
  app (): Application

  /**
   * Register application services into the container.
   */
  register (app: Application): void

  /**
   * Boot application services.
   */
  boot? (app: Application): void | Promise<void>

  /**
   * Stop application services.
   */
  shutdown? (app: Application): void | Promise<void>

  /**
   * Register a booting callback that runs before the `boot` method is called.
   */
  booting (callback: () => void): this

  /**
   * Register a booted callback that runs after the `boot` method was called.
   */
  booted (callback: () => void): this

  /**
   * Call the registered booting callbacks.
   */
  callBootingCallbacks (): void

  /**
   * Call the registered booted callbacks.
   */
  callBootedCallbacks (): void

  /**
   * Merge the content of the configuration file located at the
   * given `filePath` with the existing app configuration.
   */
  mergeConfigFrom (filePath: string, key: string): Promise<void>
}
