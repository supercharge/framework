'use strict'

import { tap } from '@supercharge/goodies'
import Winston, { format, Logger } from 'winston'
import { Logger as LoggingContract } from '@supercharge/contracts'
import { FileTransportInstance } from 'winston/lib/winston/transports'

const { combine, timestamp, printf, splat } = format

export class FileLogger implements LoggingContract {
  /**
   * The maximum log level.
   */
  private readonly level: string = 'debug'

  /**
   * The log file path.
   */
  private readonly path: string

  /**
   * The file logger instance.
   */
  private readonly logger: Logger

  /**
   * Create a new file logger instance.
   *
   * @param options
   */
  constructor (options: any) {
    this.path = options.path
    this.level = options.level || this.level

    this.logger = this.createFileLogger()
  }

  /**
   * Create a file logger instance.
   *
   * @returns {Logger}
   */
  createFileLogger (): Logger {
    return tap(this.createLogger(), (logger: Logger) => {
      logger.add(this.createFileTransport())
    })
  }

  /**
   * Create a logger instance.
   */
  createLogger (): Logger {
    return Winston.createLogger({
      format: Winston.format.combine(
        this.handleErrorLogs()
      )
    })
  }

  /**
   * The winston logger does not log error messages when passing down error objects.
   * Adding this handling manually allows users to log errors properly.
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
   * Create a file transport channel.
   *
   * @returns {FileTransportInstance}
   */
  createFileTransport (): FileTransportInstance {
    return new Winston.transports.File({
      filename: this.path,
      level: this.level,
      format: combine(
        splat(),
        timestamp(),
        printf(info => {
          return JSON.stringify(
            Object.assign(info, { time: new Date(info.timestamp).getTime() })
          )
        })
      )
    })
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
