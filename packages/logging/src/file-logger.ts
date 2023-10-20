
import { Logger } from './logger.js'
import Winston, { format } from 'winston'
import { FileTransportInstance } from 'winston/lib/winston/transports'
import { FileChannelConfig, Logger as LoggingContract } from '@supercharge/contracts'

const { combine, timestamp, printf, splat } = format

export class FileLogger extends Logger<FileChannelConfig> implements LoggingContract {
  /**
   * The log file path.
   */
  private readonly path: string

  /**
   * Create a new file logger instance.
   */
  constructor (options: FileChannelConfig = {}) {
    super(options)

    this.path = this.resolveLogFilePath(options.path)

    this.addFileTransportToLogger()
  }

  /**
   * Ensure the given file logger `options` contain a log file path.
   */
  resolveLogFilePath (path?: string): string {
    if (!path) {
      throw new Error('Missing log file path when logging to a file')
    }

    return path
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
