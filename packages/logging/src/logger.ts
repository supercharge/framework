'use strict'

import Winston, { format, Logger as WinstonLogger } from 'winston'
import { AbstractConfigSetLevels } from 'winston/lib/winston/config'

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
      levels: this.levels(),
      format: Winston.format.combine(
        this.handleErrorLogs()
      )
    })
  }

  /**
   * Returns an object of logging levels.
   *
   * @returns {Object}
   */
  levels (): AbstractConfigSetLevels {
    return Winston.config.syslog.levels
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
   * Log the given `message` at debug level.
   *
   * @param message
   */
  debug (message: string, ...context: any[]): void {
    this.logger.debug(message, ...context)
  }

  /**
   * Log the given `message` at info level.
   *
   * @param message
   */
  info (message: string, ...context: any[]): void {
    this.logger.info(message, ...context)
  }

  /**
   * Log the given `message` at notice level.
   *
   * @param message
   */
  notice (message: string, ...context: any[]): void {
    this.logger.notice(message, ...context)
  }

  /**
   * Log the given `message` at warning level.
   *
   * @param message
   */
  warning (message: string, ...context: any[]): void {
    this.logger.warning(message, ...context)
  }

  /**
   * Log the given `message` at error level.
   *
   * @param message
   */
  error (message: string, ...context: any[]): void {
    this.logger.error(message, ...context)
  }

  /**
   * Log the given `message` at critical level.
   *
   * @param message
   */
  critical (message: string, ...context: any[]): void {
    this.logger.crit(message, ...context)
  }

  /**
   * Log the given `message` at alert level.
   *
   * @param message
   */
  alert (message: string, ...context: any[]): void {
    this.logger.alert(message, ...context)
  }

  /**
   * Log the given `message` at emergency level.
   *
   * @param message
   */
  emergency (message: string, ...context: any[]): void {
    this.logger.emerg(message, ...context)
  }
}
