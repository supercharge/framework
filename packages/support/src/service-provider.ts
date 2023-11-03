
import { resolveDefaultImport, tap } from '@supercharge/goodies'
import { Application, ConfigStore, ServiceProvider as ServiceProviderContract } from '@supercharge/contracts'

type Callback = () => void

export class ServiceProvider implements ServiceProviderContract {
  /**
   * Stores the interla service provider data.
   */
  private readonly meta: {
    /**
     * The application instance.
     */
    app: Application

    /**
     * All registered booting callbacks.
     */
    bootingCallbacks: Callback[]

    /**
     * All registered booted callbacks.
     */
    bootedCallbacks: Callback[]
  }

  /**
   * Create a new service provider instance.
   */
  constructor (app: Application) {
    this.meta = { app, bootingCallbacks: [], bootedCallbacks: [] }
  }

  /**
   * Returns the application instance.
   */
  app (): Application {
    return this.meta.app
  }

  /**
   * Returns the config instance.
   */
  config (): ConfigStore {
    return this.app().config()
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

  /**
   * Stop application services.
   */
  async shutdown (): Promise<void> {
    //
  }

  /**
   * Register a booting callback that runs before the `boot` method is called.
   */
  booting (callback: Callback): this {
    return tap(this, () => {
      this.meta.bootingCallbacks.push(callback)
    })
  }

  /**
   * Returns the registered booting callbacks.
   */
  bootingCallbacks (): Callback[] {
    return this.meta.bootingCallbacks
  }

  /**
   * Register a booted callback that runs after the `boot` method was called.
   */
  booted (callback: Callback): this {
    return tap(this, () => {
      this.meta.bootedCallbacks.push(callback)
    })
  }

  /**
   * Returns the registered booted callbacks.
   */
  bootedCallbacks (): Callback[] {
    return this.meta.bootedCallbacks
  }

  /**
   * Call the registered booting callbacks.
   */
  callBootingCallbacks (): void {
    this.bootingCallbacks().forEach(callback => {
      callback()
    })
  }

  /**
   * Call the registered booted callbacks.
   */
  callBootedCallbacks (): void {
    this.bootedCallbacks().forEach(callback => {
      callback()
    })
  }

  /**
   * Merge the content of the configuration file located at the
   * given `filePath` with the existing app configuration.
   */
  async mergeConfigFrom (path: string, key: string): Promise<void> {
    const config = await resolveDefaultImport(path)

    this.config().set(key, Object.assign(
      config, this.config().get(key)
    ))
  }
}
