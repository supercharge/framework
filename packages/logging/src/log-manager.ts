
import { FileLogger } from './file-logger.js'
import { Manager } from '@supercharge/manager'
import { ConsoleLogger } from './console-logger.js'
import { Application, Logger as LoggingContract, LoggingConfig } from '@supercharge/contracts'

export class LogManager extends Manager<Application> implements LoggingContract {
  /**
   * Stores the logging config.
   */
  private readonly options: LoggingConfig

  /**
   * Create a new logs manager instance.
   */
  constructor (app: Application, config: LoggingConfig) {
    super(app)

    this.options = { ...config, channels: { ...config.channels } }
  }

  /**
   * Log the given `message` at debug level.
   */
  debug (message: string, ...context: any[]): void {
    this.driver().debug(message, ...context)
  }

  /**
   * Log the given `message` at info level.
   */
  info (message: string, ...context: any[]): void {
    this.driver().info(message, ...context)
  }

  /**
   * Log the given `message` at notice level.
   */
  notice (message: string, ...context: any[]): void {
    this.driver().notice(message, ...context)
  }

  /**
   * Log the given `message` at warning level.
   */
  warning (message: string, ...context: any[]): void {
    this.driver().warning(message, ...context)
  }

  /**
   * Log the given `message` at error level.
   */
  error (message: string, ...context: any[]): void {
    this.driver().error(message, ...context)
  }

  /**
   * Log the given `message` at critical level.
   */
  critical (message: string, ...context: any[]): void {
    this.driver().critical(message, ...context)
  }

  /**
   * Log the given `message` at alert level.
   */
  alert (message: string, ...context: any[]): void {
    this.driver().alert(message, ...context)
  }

  /**
   * Log the given `message` at emergency level.
   */
  emergency (message: string, ...context: any[]): void {
    this.driver().emergency(message, ...context)
  }

  /**
   * Returns the default logging driver name.
   */
  protected defaultDriver (): string {
    return this.options.driver ?? 'console'
  }

  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   */
  override driver (name?: string): LoggingContract {
    return super.driver(name)
  }

  /**
   * Create a file logging driver.
   */
  protected createFileDriver (): LoggingContract {
    return new FileLogger(this.options.channels.file ?? {} as any)
  }

  /**
   * Create a a console logging driver.
   */
  protected createConsoleDriver (): LoggingContract {
    return new ConsoleLogger(this.options.channels.console ?? { } as any)
  }
}
