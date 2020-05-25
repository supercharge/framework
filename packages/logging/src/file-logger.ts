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
      level: this.logLevel(),
      filename: this.path,
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
}
