
import Fs from 'node:fs'
import Path from 'node:path'
import { globbySync } from 'globby'
import { Env } from '@supercharge/env'
import { PackageJson } from 'type-fest'
import { fileURLToPath } from 'node:url'
import { Arr } from '@supercharge/arrays'
import { Str } from '@supercharge/strings'
import NormalizePath from 'normalize-path'
import { Config } from '@supercharge/config'
import { tap, upon } from '@supercharge/goodies'
import { Collect } from '@supercharge/collections'
import { Container } from '@supercharge/container'
import { LoggingServiceProvider } from '@supercharge/logging'
import {
  ApplicationCtor,
  Application as ApplicationContract,
  BootstrapperCtor,
  Bootstrapper as BootstrapperContract,
  ConfigStore,
  EnvStore,
  ErrorHandlerCtor,
  Logger,
  ServiceProvider,
  ServiceProviderCtor
} from '@supercharge/contracts'

/**
 * Add container bindings for services from this provider.
 */
declare module '@supercharge/contracts' {
  export interface ContainerBindings {
    'app': Application
    'container': Application
    'env': EnvStore
    'config': ConfigStore
  }
}

export class Application extends Container implements ApplicationContract {
  /**
   * Stores the application’s meta data, like the application’s root directory,
   * name of the environment file or whether the app is running in the console.
   */
  private readonly meta: ApplicationMeta

  /**
   * Create a new application instance.
   */
  constructor (basePath: string) {
    super()

    this.meta = {
      appRoot: this.resolveFileURLToPath(basePath),
      bootingCallbacks: [],
      serviceProviders: Arr.from(),

      isRunningInConsole: false,

      env: new Env(),
      environmentFile: '.env',

      config: new Config()
    }

    this.registerBaseBindings()
    this.registerBaseServiceProviders()
  }

  /**
   * Returns the given `fileUrlOrPath` to a path without without the `file:` prefix.
   */
  private resolveFileURLToPath (fileUrlOrPath: string): string {
    // if (typeof fileURLToPath !== 'string') {
    //   throw new Error(`Parameter to "resolveFileURLToPath" must be a string. Received "${typeof fileURLToPath}"`)
    // }

    return (fileUrlOrPath ?? '').startsWith('file:')
      ? fileURLToPath(fileUrlOrPath)
      : fileUrlOrPath
  }

  /**
   * Create a new application instance with the given `basePath` as the app root.
   */
  public static createWithAppRoot<App extends ApplicationCtor> (this: App, basePath: string): InstanceType<App> {
    return new this(basePath) as any
  }

  /**
   * Assign the given error handler to this application instance. The error
   * handler is used to report errors on the default logging channel and
   * also to create responses for requests throwing errors.
   */
  withErrorHandler (ErrorHandler: ErrorHandlerCtor): this {
    return tap(this, () => {
      this
        .singleton('error.handler', () => {
          return new ErrorHandler(this)
        })
        .alias('error.handler', ErrorHandler)
    })
  }

  /**
   * Register the base bindings into the container.
   */
  private registerBaseBindings (): void {
    this.singleton('app', () => this)
    this.singleton('container', () => this)

    this.singleton('env', () => this.env())
    this.singleton('config', () => this.config())
  }

  /**
   * Register the base service provider into the container.
   */
  private registerBaseServiceProviders (): void {
    this
      .register(new LoggingServiceProvider(this))
  }

  /**
   * Returns the env store instance.
   */
  env (): EnvStore {
    return this.meta.env
  }

  /**
   * Returns the config store instance.
   */
  config (): ConfigStore {
    return this.meta.config
  }

  /**
   * Returns the application logger instance.
   */
  logger (): Logger {
    return this.make('logger')
  }

  /**
   * Returns the application key.
   */
  key (): string {
    if (this.config().has('app.key')) {
      return this.config().get('app.key')
    }

    throw new Error('Missing app key. Please set the APP_KEY environment variable.')
  }

  /**
   * Returns the application version defined in the `package.json` file.
   */
  version (): string | undefined {
    return upon(this.readPackageJson(), pkg => {
      return pkg.version
    })
  }

  /**
   * Read the contents of the application’s `package.json` file.
   */
  private readPackageJson (): PackageJson {
    const packageJsonPath = this.resolveFromBasePath('package.json')

    return JSON.parse(
      Fs.readFileSync(packageJsonPath).toString()
    )
  }

  /**
   * Returns the root path of the application directory.
   */
  basePath (): string {
    return this.meta.appRoot
  }

  /**
   * Resolves an absolute path to the given the given `destination` in
   * the application directory, starting at the application root.
   */
  resolveFromBasePath (...destination: string[]): string {
    const basePath = Str(this.basePath()).rtrim('/').get()

    const filePath = Path.resolve(
      `${basePath}/${destination.join('/')}`
    )

    return this.resolveFileURLToPath(filePath)
  }

  /**
   * Resolves the absolute path from the given `destination` in the
   * application directory, starting from the application root.
   * The destination supports a glob format, like 'providers/**'.
   */
  resolveGlobFromBasePath (...destination: string[]): string {
    const fileUrl = NormalizePath(
      this.resolveFromBasePath(...destination)
    )

    const filePath = this.resolveFileURLToPath(fileUrl)
    const glob = globbySync(filePath).pop()

    if (!glob) {
      throw new Error(`Failed to find a matching file for the given glob pattern: ${fileUrl}`)
    }

    return glob
  }

  /**
   * Returns an absolute path into the application’s config directory.
   */
  configPath (...paths: string[]): string {
    return this.resolveFromBasePath('config', ...paths)
  }

  /**
   * Returns an absolute path into the application’s public directory.
   */
  publicPath (...paths: string[]): string {
    return this.resolveFromBasePath('public', ...paths)
  }

  /**
   * Returns an absolute path into the application’s resources directory.
   */
  resourcePath (...paths: string[]): string {
    return this.resolveFromBasePath('resources', ...paths)
  }

  /**
   * Returns an absolute path into the application’s storage directory.
   */
  storagePath (...paths: string[]): string {
    return this.resolveFromBasePath('storage', ...paths)
  }

  /**
   * Returns an absolute path into the application’s database directory.
   */
  databasePath (...paths: string[]): string {
    return this.resolveFromBasePath('database', ...paths)
  }

  /**
   * Returns the path to directory of the environment file.
   * By default, this is the application's base path.
   */
  environmentPath (): string {
    return this.meta.environmentPath ?? this.basePath()
  }

  /**
   * Set the directory for the environment file.
   */
  useEnvironmentPath (path: string): this {
    return tap(this, () => {
      this.meta.environmentPath = this.resolveFromBasePath(path)
    })
  }

  /**
   * Returns the environment file of the application. By default, this is `.env`.
   */
  environmentFile (): string {
    return this.meta.environmentFile
  }

  /**
   * Set the environment `file` name to be loaded while bootstrapping the application.
   * Only pass the file name of your environment file as an argument and not a full
   * file system path. Use the `app.useEnvironmentPath(<path>)` method to change
   * the path from which your environment files will be loaded on app start.
   */
  loadEnvironmentFrom (file: string): this {
    return tap(this, () => {
      this.meta.environmentFile = file
    })
  }

  /**
   * Returns the resolved path to the environment file.
   */
  environmentFilePath (): string {
    const environmentFilePath = Path.resolve(
      [this.environmentPath(), this.environmentFile()].join('/')
    )

    return this.resolveFileURLToPath(environmentFilePath)
  }

  /**
   * Returns the registered service providers.
   */
  serviceProviders (): Arr<ServiceProvider> {
    return this.meta.serviceProviders
  }

  /**
   * Returns the registered booting callbacks.
   */
  bootingCallbacks (): Callback[] {
    return this.meta.bootingCallbacks
  }

  /**
   * Register a booting callback that runs at the beginning of the app boot.
   *
   * @deprecated use the {@link onBooting} method
   */
  booting (callback: Callback): this {
    return this.onBooting(callback)
  }

  /**
   * Register a booting callback that runs at the beginning of the app boot.
   */
  onBooting (callback: Callback): this {
    return tap(this, () => {
      this.meta.bootingCallbacks.push(callback)
    })
  }

  /**
   * Register the configured user-land providers.
   */
  async registerConfiguredProviders (): Promise<void> {
    await Collect(
      await this.loadConfiguredProviders()
    ).forEach((Provider: ServiceProviderCtor) => {
      this.register(new Provider(this))
    })
  }

  /**
   * Resolve all registered user-land service providers from disk
   * and store them locally to registering and booting them.
   */
  async loadConfiguredProviders (): Promise<ServiceProviderCtor[]> {
    const { providers } = await this.import(
      this.resolveGlobFromBasePath('bootstrap/providers.**')
    )

    return providers
  }

  /**
   * Call the `register` method on the given service `provider`.
   */
  register (provider: ServiceProvider): this {
    provider.register(this)

    return this.markAsRegistered(provider)
  }

  /**
   * Mark the given `provider` as registered.
   */
  protected markAsRegistered (provider: ServiceProvider): this {
    return tap(this, () => {
      this.serviceProviders().push(provider)
    })
  }

  /**
   * Returns the content of the dynamically imported `path`.
   */
  async import<T = any> (path: string): Promise<T> {
    if (!path) {
      throw new Error(`Cannot import missing or empty "path". Received "${path}" (${typeof path})`)
    }

    return await import(path)
  }

  /**
   * Boot the application’s service providers.
   */
  async boot (): Promise<void> {
    await Collect(
      this.serviceProviders().all()
    ).forEach(async provider => {
      await this.bootProvider(provider)
    })
  }

  /**
   * Boot the given service `provider`.
   */
  private async bootProvider (provider: ServiceProvider): Promise<void> {
    provider.callBootingCallbacks()

    if (typeof provider.boot === 'function') {
      await provider.boot(this)
    }

    provider.callBootedCallbacks()
  }

  /**
   * Prepare booting application by running the `bootstrappers`.
   */
  async bootstrapWith (bootstrappers: BootstrapperCtor[]): Promise<void> {
    await this.runAppCallbacks(this.bootingCallbacks())

    await Collect(bootstrappers).forEach(async (Bootstrapper: BootstrapperCtor) => {
      await this.make<BootstrapperContract>(Bootstrapper).bootstrap(this)
    })
  }

  /**
   * Call the given booting `callbacks` for this application.
   */
  async runAppCallbacks (callbacks: Callback[]): Promise<void> {
    await Collect(callbacks).forEach(async callback => {
      // eslint-disable-next-line n/no-callback-literal
      await callback(this)
    })
  }

  /**
   * Shutdown the application by stopping all providers.
   */
  async shutdown (): Promise<void> {
    await Collect(
      this.serviceProviders().all()
    ).forEach(async provider => {
      await this.shutdownProvider(provider)
    })
  }

  /**
   * Run the shutdown methods for the given service `provider`.
   */
  private async shutdownProvider (provider: ServiceProvider): Promise<void> {
    if (typeof provider.shutdown === 'function') {
      await provider.shutdown(this)
    }
  }

  /**
   * Determine whether the application is running in the console.
   */
  isRunningInConsole (): boolean {
    return this.meta.isRunningInConsole
  }

  /**
   * Mark the application as running in the console.
   */
  markAsRunningInConsole (): this {
    return tap(this, () => {
      this.meta.isRunningInConsole = true
    })
  }
}

interface ApplicationMeta {
  /**
   * The absolute path to the application’s root directory.
   */
  appRoot: string

  /**
   * The config store instance.
   */
  config: ConfigStore

  /**
   * The env store instance.
   */
  env: EnvStore

  /**
   * The environment file to load during application bootstrapping.
   */
  environmentFile: string

  /**
   * The directory for the environment file.
   */
  environmentPath?: string

  /**
   * Indicate whether the application runs in the console.
   */
  isRunningInConsole: boolean

  /**
   * All booting callbacks.
   */
  bootingCallbacks: Callback[]

  /**
   * All registered service providers.
   */
  serviceProviders: Arr<ServiceProvider>
}

type Callback = (app: Application) => unknown | Promise<unknown>
