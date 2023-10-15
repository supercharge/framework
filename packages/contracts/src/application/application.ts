
import { BootstrapperCtor, ErrorHandlerCtor, EnvStore, Logger, ConfigStore, Container, ServiceProvider } from '..'

type Callback = (app: Application) => Promise<unknown> | unknown

export type ApplicationCtor = new (basePath: string) => Application

export interface Application extends Container {
  /**
   * Returns the logger instance.
   */
  logger(): Logger

  /**
   * Returns the app key.
   */
  key(): string

  /**
   * Returns the app version.
   */
  version(): string | undefined

  /**
   * Assign the given error handler to this application instance. The error
   * handler is used to report errors on the default logging channel and
   * also to create responses for requests throwing errors.
   */
  withErrorHandler (ErrorHandler: ErrorHandlerCtor): this

  /**
   * Register a booting callback that runs at the beginning of the app boot.
   */
  onBooting (callback: Callback): this

  /**
   * Returns the root path of the application directory.
   */
  basePath(): string

  /**
   * Returns the resolved path to `path` starting at the application’s base path.
   */
  resolveFromBasePath(...paths: string[]): string

  /**
   * Returns the resolved path to `path` starting at the application’s base path.
   */
  resolveGlobFromBasePath(...paths: string[]): string

  /**
   * Returns the config store instance.
   */
  config (): ConfigStore

  /**
   * Returns an absolute path into the application’s config directory.
   *
   * @param {String} path
   */
  configPath (...paths: string[]): string

  /**
   * Returns an absolute path into the application’s public directory.
   *
   * @param {String} path
   */
  publicPath (...paths: string[]): string

  /**
   * Returns an absolute path into the application’s resources directory.
   *
   * @param {String} path
   */
  resourcePath (...paths: string[]): string

  /**
   * Returns an absolute path into the application’s storage directory.
   *
   * @param {String} path
   */
  storagePath (...paths: string[]): string

  /**
   * Returns an absolute path into the application’s database directory.
   *
   * @param {String} path
   */
  databasePath (...paths: string[]): string

  /**
   * The env store instance.
   */
  env(): EnvStore

  /**
   * Returns the path to directory of the environment file.
   * By default, this is the application's base path.
   *
   * @param {String} path - an optional path appended to the config path
   */
  environmentPath(): string

  /**
   * Set the directory for the environment file.
   *
   * @param {String} path
   */
  useEnvironmentPath(path: string): this

  /**
   * Returns the environment file of the application. By default, this is `.env`.
   */
  environmentFile(): string

  /**
   * Set the environment `file` name to be loaded while bootstrapping the application.
   * Only pass the file name of your environment file as an argument and not a full
   * file system path. Use the `app.useEnvironmentPath(<path>)` method to change
   * the path from which your environment files will be loaded on app start.
   *
   * @param {String} file
   */
  loadEnvironmentFrom(file: string): this

  /**
   * Returns the resolved path to the environment file.
   */
  environmentFilePath(): string

  /**
   * Prepare booting application by running the array of `bootstrappers`.
   *
   * @param {Array} bootstrappers
   */
  bootstrapWith(bootstrappers: BootstrapperCtor[]): Promise<void>

  /**
   * Call the `register` method on the given service `provider`.
   */
  register (provider: ServiceProvider): this

  /**
   * Register the configured user-land providers.
   */
  registerConfiguredProviders(): Promise<void>

  /**
   * Boot the application.
   */
  boot(): Promise<void>

  /**
   * Shutdown the application.
   */
  shutdown(): Promise<void>

  /**
   * Determine whether the application is running in the console.
   */
  isRunningInConsole (): boolean

  /**
   * Mark the application as running in the console.
   */
  markAsRunningInConsole (): this
}
