'use strict'

import Winston, { format, Logger as WinstonLogger } from 'winston'

export class Logger {
  /**
   * The maximum log level.
   */
  protected readonly level: string = 'debug'

  /**
   * The logger instance.
   */
  protected readonly logger: WinstonLogger

  /**
   * Create a new console logger instance.
   *
   * @param options
   */
  constructor (options: any) {
    this.level = options.level || this.level

    this.logger = this.createLogger()
  }

  /**
   * Create a logger instance.
   *
   * @returns {Logger}
   */
  createLogger (): WinstonLogger {
    return Winston.createLogger({
      format: Winston.format.combine(
        this.handleErrorLogs()
      )
    })
  }

  /**
   * The winston logger does not log error messages when
   * passing down error objects. Adding this handling
   * manually allows users to log errors properly.
   *
   * @returns {Format}
   */
  handleErrorLogs (): any {
    const formatter = format(log => {
      return log instanceof Error
        ? Object.assign({ message: `${log.message}\n${log.stack}` }, log)
        : log
    })

    return formatter()
  }

  /**
   * Log the given `message` at trace level.
   *
   * @param message
   */
  trace (message: string): void {
    this.logger.log('trace', message)
  }

  /**
   * Log the given `message` at debug level.
   *
   * @param message
   */
  debug (message: string): void {
    this.logger.debug(message)
  }

  /**
   * Log the given `message` at info level.
   *
   * @param message
   */
  info (message: string): void {
    this.logger.info(message)
  }

  /**
   * Log the given `message` at warn level.
   *
   * @param message
   */
  warn (message: string): void {
    this.logger.warn(message)
  }

  /**
   * Log the given `message` at error level.
   *
   * @param message
   */
  error (message: string): void {
    this.logger.error(message)
  }

  /**
   * Log the given `message` at fatal level.
   *
   * @param message
   */
  fatal (message: string): void {
    this.logger.log('fatal', message)
  }
}
