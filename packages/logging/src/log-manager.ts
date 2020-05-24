'use strict'

import { FileLogger } from './file-logger'
import { Manager } from '@supercharge/manager'
import { ConsoleLogger } from './console-logger'
import { Logger as LoggingContract } from '@supercharge/contracts'

export class LogManager extends Manager implements LoggingContract {
  /**
   * Returns the default logging driver name.
   *
   * @returns {String}
   */
  protected defaultDriver (): string {
    return this.config().get('logging.driver', 'console')
  }

  /**
   * Log the given `message` at trace level.
   *
   * @param message
   */
  trace (message: string): void {
    this.driver().trace(message)
  }

  /**
   * Log the given `message` at debug level.
   *
   * @param message
   */
  debug (message: string): void {
    this.driver().debug(message)
  }

  /**
   * Log the given `message` at info level.
   *
   * @param message
   */
  info (message: string): void {
    this.driver().info(message)
  }

  /**
   * Log the given `message` at warn level.
   *
   * @param message
   */
  warn (message: string): void {
    this.driver().warn(message)
  }

  /**
   * Log the given `message` at error level.
   *
   * @param message
   */
  error (message: string): void {
    this.driver().error(message)
  }

  /**
   * Log the given `message` at fatal level.
   *
   * @param message
   */
  fatal (message: string): void {
    this.driver().fatal(message)
  }

  /**
   * Returns the logging driver instance.
   *
   * @param name
   *
   * @returns {LoggingContract}
   *
   * @throws
   */
  protected driver (name = this.defaultDriver()): LoggingContract {
    return super.driver(name)
  }

  /**
   * Create a file logging driver.
   *
   * @returns {BcryptHasher}
   */
  protected createFileDriver (): FileLogger {
    return new FileLogger(
      this.config().get('logging.channels.file', {})
    )
  }

  /**
   * Create a a console logging driver.
   *
   * @returns {ArgonHasher}
   */
  protected createConsoleDriver (): ConsoleLogger {
    return new ConsoleLogger(
      this.config().get('logging.channels.console', {})
    )
  }
}
