'use strict'

import Fs from 'fs'
import Path from 'path'
import Glob from 'globby'
import Module from 'module'
import { Ioc } from '@adonisjs/fold'
import { Env } from '@supercharge/env'
import { PackageJson } from 'type-fest'
import { Config } from '@supercharge/config'
import Collect from '@supercharge/collections'
import { tap, upon } from '@supercharge/goodies'
import {
  EnvStore,
  ConfigStore,
  Bootstrapper,
  BootstrapperCtor,
  ServiceProvider,
  ServiceProviderCtor,
  Application as ApplicationContract
} from '@supercharge/contracts'
import { RoutingServiceProvider } from '@supercharge/routing/dist/src/routing-service-provider'

export class Application implements ApplicationContract {
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
    this.meta = {
      appRoot: basePath,
      serviceProviders: [],

      env: new Env(),
      environmentFile: '.env',

      config: new Config(),
      container: new Ioc(),

      isRunningInConsole: false
    }

    this.registerBaseBindings()
    this.registerBaseServiceProviders()
    this.registerIocRequireTransformation()
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
   * Register the base bindings into the container.
   */
  private registerBaseBindings (): void {
    this.container().singleton('supercharge/app', () => this)
  }

  /**
   * Register the base service provider into the container.
   */
  private registerBaseServiceProviders (): void {
    this.register(new RoutingServiceProvider(this))
  }

  /**
   * TODO move this part to a separate package or file. Needs some rework as well.
   * Maybe us a package like https://github.com/ariporad/pirates or
   * https://github.com/bahmutov/node-hook to intercep “require” calls
   */
  private registerIocRequireTransformation (): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const app: Application = this

    const origRequire = Module.prototype.require
    const _require = function (context: any, path: string): any {
      return origRequire.call(context, path)
    }

    // @ts-expect-error
    Module.prototype.require = function (path) {
      if (path.startsWith('@ioc:')) {
        return app.container().make(
          path.slice(5) // remove the '@ioc:' prefix and resolve dependency
        )
      }

      return _require(this, path)
    }
  }

  /**
   * Returns the container instance.
   *
   * @returns {Ioc}
   */
  public container (): Ioc {
    return this.meta.container
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
  configPath (path: string): string {
    return this.resolveFromBasePath('config', path)
  }

  /**
   * Returns an absolute path into the application’s resources directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  resourcePath (path: string): string {
    return this.resolveFromBasePath('resources', path)
  }

  /**
   * Returns an absolute path into the application’s storage directory.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  storagePath (path: string): string {
    return this.resolveFromBasePath('storage', path)
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
   * Register the configured user-land providers.
   */
  async registerConfiguredProviders (): Promise<void> {
    this.loadConfiguredProviders()
    this.registerServiceProviders()
  }

  loadConfiguredProviders (): void {
    const { providers } = this.require(
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
    return require(path)
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
    await provider.callBootingCallbacks()

    if (typeof provider.boot === 'function') {
      await provider.boot(this)
    }

    await provider.callBootedCallbacks()
  }

  /**
   * Prepare booting application by running the `bootstrappers`.
   *
   * @param {Array} bootstrappers
   */
  async bootstrapWith (bootstrappers: BootstrapperCtor[]): Promise<void> {
    await Collect(bootstrappers).forEach(
      async (bootstrapper: BootstrapperCtor) => {
        return await this.make(bootstrapper).bootstrap(this)
      }
    )
  }

  /**
   * Returns a bootstrapper instance.
   *
   * @param Candidate
   *
   * @returns {Bootstrapper}
   */
  make (Candidate: BootstrapperCtor): Bootstrapper {
    return new Candidate(this)
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
   * The IoC container instance.
   */
  container: Ioc

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
}
