
import { Application } from '../index.js'

type BootCallback = () => Promise<unknown> | unknown

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
  booting (callback: BootCallback): this

  /**
   * Register a booted callback that runs after the `boot` method was called.
   */
  booted (callback: BootCallback): this

  /**
   * Call the registered booting callbacks.
   */
  callBootingCallbacks (): Promise<void>

  /**
   * Call the registered booted callbacks.
   */
  callBootedCallbacks (): Promise<void>

  /**
   * Merge the content of the configuration file located at the
   * given `filePath` with the existing app configuration.
   */
  mergeConfigFrom (filePath: string, key: string): Promise<void>
}
