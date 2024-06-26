
import { Logger } from './logger.js'
import Winston, { format } from 'winston'
import Chalk, { ChalkInstance } from 'chalk'
import { ConsoleTransportInstance } from 'winston/lib/winston/transports'
import { ConsoleChannelConfig, Logger as LoggingContract } from '@supercharge/contracts'

const { combine, timestamp, printf, splat } = format

export class ConsoleLogger extends Logger<ConsoleChannelConfig> implements LoggingContract {
  /**
   * Create a new console logger instance.
   */
  constructor (config: ConsoleChannelConfig) {
    super(config)

    this.addConsoleTransportToLogger()
  }

  /**
   * Append a console transport to the logger instance.
   */
  addConsoleTransportToLogger (): void {
    this.logger.add(
      this.createConsoleTransport()
    )
  }

  /**
   * Create a file transport channel.
   */
  createConsoleTransport (): ConsoleTransportInstance {
    return new Winston.transports.Console({
      level: this.logLevel(),
      format: combine(
        splat(),
        timestamp(),
        printf(log => this.createLogMessage(log))
      )
    })
  }

  /**
   * Returns a log message.
   */
  createLogMessage (logItem: any): string {
    const { level, message, [Symbol.for('splat')]: meta } = logItem

    const color = this.getColorForLevel(level)
    const time = this.retrieveLogTimeFrom(logItem)

    return `${Chalk.gray(time)} ${color(level)} ${message} `.concat(
      meta ? JSON.stringify(meta[0]) : ''
    )
  }

  /**
   * Return a chalk function for the related log level,
   * to print colored logs.
   *
   * E.g.,
   * info  => green
   * warn  => yellow
   * error => bold red
   */
  getColorForLevel (label: string): ChalkInstance {
    return this.logColors()[label] ?? Chalk.white
  }

  /**
   * Color levels, ranked ascending from freakout to chilly.
   */
  logColors (): any {
    return {
      emerg: Chalk.bold.red,
      alert: Chalk.bold.red,
      crit: Chalk.bold.redBright,
      error: Chalk.red,
      warning: Chalk.yellow,
      notice: Chalk.magenta,
      info: Chalk.green,
      debug: Chalk.blue
    }
  }

  /**
   * Returns the time of the log item in milliseconds.
   */
  private retrieveLogTimeFrom (logItem: any): number {
    return new Date(logItem.timestamp).getTime()
  }
}
