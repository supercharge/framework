
import { Logger } from './logger'
import Winston, { format } from 'winston'
import Chalk, { ChalkFunction } from 'chalk'
import { ConsoleTransportInstance } from 'winston/lib/winston/transports'
import { ConsoleChannelConfig, Logger as LoggingContract } from '@supercharge/contracts'

const { combine, timestamp, printf, splat } = format

export class ConsoleLogger extends Logger<ConsoleChannelConfig> implements LoggingContract {
  /**
   * Create a new console logger instance.
   *
   * @param config
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
   *
   * @returns {ConsoleTransportInstance}
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
   *
   * @param {Object} logItem
   *
   * @returns {String}
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
   *
   * @param {integer} label - Winston log level as a string label
   *
   * @returns {Function}
   */
  getColorForLevel (label: string): ChalkFunction {
    return this.logColors()[label] || Chalk.white
  }

  /**
   * Color levels, ranked ascending from freakout to chilly.
   *
   * @returns {Object}
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
   *
   * @param {Object} logItem
   *
   * @returns {Number}
   */
  private retrieveLogTimeFrom (logItem: any): number {
    return new Date(logItem.timestamp).getTime()
  }
}
