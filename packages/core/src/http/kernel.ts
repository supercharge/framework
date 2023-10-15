
import { tap } from '@supercharge/goodies'
import Collect from '@supercharge/collections'
import { Application, BootstrapperCtor, HttpKernel as HttpKernelContract, HttpServer, HttpServerHandler, MiddlewareCtor } from '@supercharge/contracts'
import { HandleExceptions, LoadConfiguration, LoadEnvironmentVariables, RegisterServiceProviders, BootServiceProviders, HandleShutdown } from '../bootstrappers'

type Callback = () => unknown | Promise<unknown>

export class HttpKernel implements HttpKernelContract {
  /**
   * Stores the HTTP kernel’s meta data.
   */
  private readonly meta: {
    /**
     * The application instance.
     */
    app: Application

    /**
     * Stores the "booted" callbacks
     */
    bootedCallbacks: Callback[]

    /**
     * Determine whether the bootstrapping ran.
     */
    isBootstrapped: boolean
  }

  /**
   * Create a new HTTP kernel instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.meta = {
      app,
      bootedCallbacks: [],
      isBootstrapped: false
    }

    this.registerHttpContainerBindings()
    this.register()
  }

  /**
   * Creates a new HTTP kernel instance for the given `app`.
   *
   * @param {Application} app
   */
  static for (app: Application): HttpKernel {
    return new this(app)
  }

  /**
   * Returns the app instance.
   */
  app (): Application {
    return this.meta.app
  }

  /**
   * Register the HTTP base bindings into the container.
   */
  private registerHttpContainerBindings (): void {
    this.app().singleton('http.kernel', () => this)
  }

  /**
   * Determine whether the HTTP kernel is already boostrapped.
   *
   * @returns {Boolean}
   */
  isBootstrapped (): boolean {
    return this.meta.isBootstrapped
  }

  /**
   * Determine whether the HTTP kernel is not boostrapped yet.
   *
   * @returns {Boolean}
   */
  isNotBootstrapped (): boolean {
    return !this.isBootstrapped()
  }

  /**
   * Mark this HTTP kernel as bootstrapped.
   *
   * @returns {this}
   */
  markAsBootstrapped (): this {
    return tap(this, () => {
      this.meta.isBootstrapped = true
    })
  }

  /**
   * Returns the HTTP server instance.
   *
   * @returns {Server}
   */
  server (): HttpServer {
    return this.app().make<HttpServer>('server')
  }

  /**
   * Register the booting or booted callbacks. For example, you may use a `booted`
   * callback to send a "ready" signal to PM2 (or any other process manager)
   * informing that your HTTP server is ready to accept incoming requests.
   */
  register (): void {
    //
  }

  /**
   * Returns the application’s global middleware stack. Every middleware
   * listed here runs on every request to the application.
   *
   * @returns {MiddlewareCtor[]}
   */
  middleware (): MiddlewareCtor[] {
    return []
  }

  /**
   * Returns the application’s global middleware stack. Every middleware
   * listed here runs on every request to the application.
   *
   * @returns {{ [key: string]: MiddlewareCtor}}
   */
  routeMiddleware (): { [key: string]: MiddlewareCtor} {
    return {}
  }

  /**
   * Register a booted callback that runs after the HTTP server started.
   *
   * @returns {this}
   */
  booted (callback: Callback): this {
    return tap(this, () => {
      this.bootedCallbacks().push(callback)
    })
  }

  /**
   * Returns the booted callbacks.
   *
   * @returns {Callback[]}
   */
  bootedCallbacks (): Callback[] {
    return this.meta.bootedCallbacks
  }

  /**
   * Returns a request handler callback compatible with Node.js’ native HTTP server. This method
   * bootstraps the HTTP server instance by registering routes and middleware before returning
   * it. This request handler callback is useful during testing when sending requests into
   * the HTTP server instance with a community package, like Supertest from visionmedia.
   *
   * @returns {HttpServerHandler}
   */
  async serverCallback (): Promise<HttpServerHandler> {
    if (this.isNotBootstrapped()) {
      await this.bootstrap()
      await this.runBootedCallbacks()
    }

    return this.server().callback()
  }

  /**
   * Start the HTTP instance listening for incoming requests.
   *
   * @returns {Promise<this>}
   */
  async startServer (): Promise<this> {
    await this.bootstrap()
    await this.listen()
    await this.runBootedCallbacks()

    return this
  }

  /**
   * Start the HTTP server to listen on a local port.
   */
  protected async listen (): Promise<void> {
    await this.server().start()
  }

  /**
   * Stop the HTTP instance.
   *
   * @returns {Promise<this>}
   */
  async stopServer (): Promise<this> {
    return await tap(this, async () => {
      await this.server().stop()
    })
  }

  /**
   * Prepare the application by running the configured bootstrappers. This
   * method doesn’t register routes or middleware to the underlying HTTP
   * server. It prepares the application which is useful for testing.
   */
  async prepare (): Promise<this> {
    await this.app().bootstrapWith(
      this.bootstrappers()
    )

    return this
  }

  /**
   * Bootstrap the HTTP kernel by loading environment variables and all files
   * within the `config` directory, register and boot all the given service
   * providers, and ultimately register the HTTP middleware and routes.
   */
  async bootstrap (): Promise<void> {
    if (this.isBootstrapped()) {
      return
    }

    await this.prepare()
    this.registerMiddleware()
    this.server().bootstrap()
    this.markAsBootstrapped()
  }

  /**
   * Returns the list of application bootstrappers.
   */
  bootstrappers (): BootstrapperCtor[] {
    return [
      HandleExceptions,
      HandleShutdown,
      LoadEnvironmentVariables,
      LoadConfiguration,
      RegisterServiceProviders,
      BootServiceProviders
    ]
  }

  /**
   * Register the configured middleware stacks to the HTTP server.
   */
  registerMiddleware (): void {
    this.registerAppMiddleware()
    this.registerRouteLevelMiddleware()
  }

  /**
   * Register the application middleware stack to the HTTP server.
   */
  registerAppMiddleware (): void {
    this.middleware().forEach((Middleware: MiddlewareCtor) => {
      this.server().use(Middleware)
    })
  }

  /**
   * Sync the available middleware to the router.
   */
  registerRouteLevelMiddleware (): void {
    Object.entries(
      this.routeMiddleware()
    ).forEach(([name, middleware]) => {
      this.server().useRouteMiddleware(name, middleware)
    })
  }

  /**
   * Run the configured `booted` callbacks.
   */
  protected async runBootedCallbacks (): Promise<void> {
    await this.runCallbacks(
      this.bootedCallbacks()
    )
  }

  /**
   * Call the given kernal `callbacks`.
   *
   * @param {Callback[]} callbacks
   */
  protected async runCallbacks (callbacks: Callback[]): Promise<void> {
    await Collect(callbacks).forEach(async callback => {
      await callback()
    })
  }
}
