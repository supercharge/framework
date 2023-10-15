
import { FileLogger } from './file-logger'
import { Manager } from '@supercharge/manager'
import { ConsoleLogger } from './console-logger'
import { Application, Logger as LoggingContract, LoggingConfig } from '@supercharge/contracts'

export class LogManager extends Manager implements LoggingContract {
  /**
   * Stores the logging config.
   */
  private readonly options: LoggingConfig

  /**
   * Create a new logs manager instance.
   *
   * @param {Application} app
   */
  constructor (app: Application, config: LoggingConfig) {
    super(app)

    this.options = { ...config, channels: { ...config.channels } }
  }

  /**
   * Log the given `message` at debug level.
   *
   * @param message
   */
  debug (message: string, ...context: any[]): void {
    this.driver().debug(message, ...context)
  }

  /**
   * Log the given `message` at info level.
   *
   * @param message
   */
  info (message: string, ...context: any[]): void {
    this.driver().info(message, ...context)
  }

  /**
   * Log the given `message` at notice level.
   *
   * @param message
   */
  notice (message: string, ...context: any[]): void {
    this.driver().notice(message, ...context)
  }

  /**
   * Log the given `message` at warning level.
   *
   * @param message
   */
  warning (message: string, ...context: any[]): void {
    this.driver().warning(message, ...context)
  }

  /**
   * Log the given `message` at error level.
   *
   * @param message
   */
  error (message: string, ...context: any[]): void {
    this.driver().error(message, ...context)
  }

  /**
   * Log the given `message` at critical level.
   *
   * @param message
   */
  critical (message: string, ...context: any[]): void {
    this.driver().critical(message, ...context)
  }

  /**
   * Log the given `message` at alert level.
   *
   * @param message
   */
  alert (message: string, ...context: any[]): void {
    this.driver().alert(message, ...context)
  }

  /**
   * Log the given `message` at emergency level.
   *
   * @param message
   */
  emergency (message: string, ...context: any[]): void {
    this.driver().emergency(message, ...context)
  }

  /**
   * Returns the default logging driver name.
   *
   * @returns {String}
   */
  protected defaultDriver (): string {
    return this.options.driver ?? 'console'
  }

  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   *
   * @param {String} name
   *
   * @returns {ViewEngine}
   */
  override driver (name?: string): LoggingContract {
    return super.driver(name)
  }

  /**
   * Create a file logging driver.
   *
   * @returns {FileLogger}
   */
  protected createFileDriver (): LoggingContract {
    return new FileLogger(this.options.channels.file ?? {} as any)
  }

  /**
   * Create a a console logging driver.
   *
   * @returns {Logger}
   */
  protected createConsoleDriver (): LoggingContract {
    return new ConsoleLogger(this.options.channels.console ?? { } as any)
  }
}
