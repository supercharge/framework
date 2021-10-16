'use strict'

import Fs from 'fs'
import Path from 'path'
import Glob from 'globby'
import { Env } from '@supercharge/env'
import { PackageJson } from 'type-fest'
import { Config } from '@supercharge/config'
import Collect from '@supercharge/collections'
import { Container } from '@supercharge/container'
import { HttpServiceProvider } from '@supercharge/http'
import { esmRequire, tap, upon } from '@supercharge/goodies'
import { LoggingServiceProvider } from '@supercharge/logging'
import { EnvStore, ConfigStore, BootstrapperCtor, ServiceProvider, ServiceProviderCtor, Application as ApplicationContract, Logger, ErrorHandlerCtor } from '@supercharge/contracts'

export class Application extends Container implements ApplicationContract {
  /**
   * Stores the application’s meta data, like the application’s root directory,
   * name of the environment file or whether the app is running in the console.
   */
  private meta: ApplicationMeta

  /**
   * Create a new application instance.
   *
   * @param basePath - the application root path
   */
  constructor (basePath: string) {
    super()

    this.meta = {
      appRoot: basePath,
      serviceProviders: [],
      bootingCallbacks: [],

      isRunningInConsole: false,

      env: new Env(),
      environmentFile: '.env',

      config: new Config()
    }

    this.registerBaseBindings()
    this.registerBaseServiceProviders()
  }

  /**
   * Create a new application instance.
   *
   * @param {String} basePath - absolute path to the application’s root directory
   *
   * @returns {Application}
   */
  public static createWithAppRoot (basePath: string): Application {
    return new Application(basePath)
  }

  /**
   * Assign the given error handler to this application instance. The error
   * handler is used to report errors on the default logging channel and
   * also to create responses for requests throwing errors.
   *
   * @param ErrorHandler
   *
   * @returns {Application}
   */
  withErrorHandler (ErrorHandler: ErrorHandlerCtor): Application {
    return tap(this, () => {
      this.singleton('error.handler', () => {
        return new ErrorHandler(this)
      })
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
    this.register(new HttpServiceProvider(this))
    this.register(new LoggingServiceProvider(this))
  }

  /**
   * Returns the application logger instance.
   *
   * @returns {Logger}
   */
  logger (): Logger {
    return this.make('logger')
  }

  /**
   * Returns the application key.
   *
   * @returns {String}
   *
   * @throws
   */
  key (): string {
    if (this.config().has('app.key')) {
      return this.config().get('app.key')
    }

    throw new Error('Missing app key. Please set the APP_KEY environment variable.')
  }

  /**
   * Returns the application version defined in the `package.json` file.
   *
   * @returns {String}
   */
  version (): string | undefined {
    return upon(this.readPackageJson(), pkg => {
      return pkg.version
    })
  }

  /**
   * Read the contents of the application’s `package.json` file.
   *
   * @returns {String}
   */
  readPackageJson (): PackageJson {
    return JSON.parse(
      Fs.readFileSync(
        this.resolveFromBasePath('package.json')
      ).toString()
    )
  }

  /**
   * Resolves an absolute path to the given the given `destination` in
   * the application directory, starting at the application root.
   *
   * @param {String} destination
   *
   * @returns {String}
   */
  resolveFromBasePath (...destination: string[]): string {
    return Path.resolve(this.basePath(), ...destination)
  }

  /**
   * Determine whether the application is in debug mode.
   *
   * @returns {Boolean}
   */
  debug (): boolean {
    return !!this.config().get('app.debug')
  }

  /**
   * Resolves the absolute path from the given `destination` in the
   * application directory, starting from the application root.
   * The destination supports a glob format, like 'providers/**'.
   *
   * @param destination
   *
   * @returns {String}
   */
  resolveGlobFromBasePath (...destination: string[]): string {
    return Glob.sync(
      this.resolveFromBasePath(...destination)
    )[0]
  }

  /**
   * Returns the root path of the application directory.
   *
   * @returns {String}
   */
  basePath (): string {
    return this.meta.appRoot
  }

  /**
   * Returns the config store instance.
   *
   * @returns {ConfigStore}
   */
  config (): ConfigStore {
    return this.meta.config
  }

  /**
   * Returns an absolute path into the application’s config directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  configPath (path?: string): string {
    return this.resolveFromBasePath('config', path ?? '')
  }

  /**
   * Returns an absolute path into the application’s public directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  publicPath (path?: string): string {
    return this.resolveFromBasePath('public', path ?? '')
  }

  /**
   * Returns an absolute path into the application’s resources directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  resourcePath (path?: string): string {
    return this.resolveFromBasePath('resources', path ?? '')
  }

  /**
   * Returns an absolute path into the application’s storage directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  storagePath (path?: string): string {
    return this.resolveFromBasePath('storage', path ?? '')
  }

  /**
   * Returns an absolute path into the application’s database directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  databasePath (path?: string): string {
    return this.resolveFromBasePath('database', path ?? '')
  }

  /**
   * Returns the env store instance.
   *
   * @returns {EnvStore}
   */
  env (): EnvStore {
    return this.meta.env
  }

  /**
   * Returns the environment file of the application. By default, this is `.env`.
   *
   * @returns {String}
   */
  environmentFile (): string {
    return this.meta.environmentFile || '.env'
  }

  /**
   * Set the environment file to be loaded while bootstrapping the application.
   *
   * @param {String} file
   *
   * @returns {Application}
   */
  loadEnvironmentFrom (file: string): this {
    return tap(this, () => {
      this.meta.environmentFile = file
    })
  }

  /**
   * Returns the path to directory of the environment file.
   * By default, this is the application's base path.
   *
   * @returns {String}
   */
  environmentPath (): string {
    return this.basePath()
  }

  /**
   * Returns the registered service providers.
   */
  serviceProviders (): ServiceProvider[] {
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
   * @param {Function} callback
   */
  booting (callback: Callback): this {
    return tap(this, () => {
      this.meta.bootingCallbacks.push(callback)
    })
  }

  /**
   * Register the configured user-land providers.
   */
  async registerConfiguredProviders (): Promise<void> {
    await this.loadConfiguredProviders()
    this.registerServiceProviders()
  }

  /**
   * Resolve all registered user-land service providers from disk
   * and store them locally to registering and booting them.
   */
  async loadConfiguredProviders (): Promise<void> {
    const { providers } = await this.require(
      this.resolveGlobFromBasePath('bootstrap/providers.**')
    )

    Collect(
      ([] as ServiceProviderCtor[]).concat(providers)
    ).forEach(Provider => {
      this.serviceProviders().push(
        new Provider(this)
      )
    })
  }

  /**
   * Register the configured service providers.
   */
  registerServiceProviders (): void {
    this.serviceProviders().forEach(provider => {
      this.register(provider)
    })
  }

  /**
   * Call the `register` method on the given service `provider`.
   */
  register (provider: ServiceProvider): ServiceProvider {
    return tap(provider, () => {
      provider.register(this)
    })
  }

  /**
   * Returns the content of the required `path`.
   *
   * @param path
   *
   * @returns {*}
   */
  require (path: string): any {
    return esmRequire(path)
  }

  /**
   * Boot the application’s service providers.
   */
  async boot (): Promise<void> {
    await Collect(
      this.serviceProviders()
    ).forEach(async provider => {
      await this.bootProvider(provider)
    })
  }

  /**
   * Boot the given service `provider`.
   *
   * @param provider
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
   *
   * @param {Array} bootstrappers
   */
  async bootstrapWith (bootstrappers: BootstrapperCtor[]): Promise<void> {
    await this.runAppCallbacks(this.bootingCallbacks())

    await Collect(bootstrappers).forEach(async (Bootstrapper: BootstrapperCtor) => {
      // TODO: resolve the instance through the container?
      await new Bootstrapper(this).bootstrap(this)
    })
  }

  /**
   * Call the given booting `callbacks` for this application.
   *
   * @param {Callback[]} callbacks
   */
  async runAppCallbacks (callbacks: Callback[]): Promise<void> {
    await Collect(callbacks).forEach(async callback => {
      await callback(this)
    })
  }

  /**
   * Determine whether the application is running in the console.
   *
   * @returns {Boolean}
   */
  isRunningInConsole (): boolean {
    return this.meta.isRunningInConsole
  }

  /**
   * Mark the application as running in the console.
   *
   * @returns {Application}
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
   * Indicate whether the application runs in the console.
   */
  isRunningInConsole: boolean

  /**
   * All registered service providers.
   */
  serviceProviders: ServiceProvider[]

  /**
   * All booting callbacks.
   */
  bootingCallbacks: Callback[]
}

type Callback = (app: Application) => unknown | Promise<unknown>
