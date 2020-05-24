'use strict'

import { Logger } from './logger'
import Winston, { format } from 'winston'
import { Logger as LoggingContract } from '@supercharge/contracts'
import { FileTransportInstance } from 'winston/lib/winston/transports'

const { combine, timestamp, printf, splat } = format

export class FileLogger extends Logger implements LoggingContract {
  /**
   * The log file path.
   */
  private readonly path: string

  /**
   * Create a new file logger instance.
   *
   * @param options
   */
  constructor (options: any) {
    super(options)

    this.path = options.path
    this.addFileTransportToLogger()
  }

  /**
   * Append a file transport to the logger instance.
   */
  addFileTransportToLogger (): void {
    this.logger.add(
      this.createFileTransport()
    )
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
