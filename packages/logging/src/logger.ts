
import { LogChannelConfig } from '@supercharge/contracts'
import Winston, { format, Logger as WinstonLogger } from 'winston'
import { AbstractConfigSetLevels, AbstractConfigSetColors } from 'winston/lib/winston/config'

export class Logger<LoggingChannelConfig extends LogChannelConfig> {
  /**
   * Stores the logging channel config.
   */
  protected readonly config: LoggingChannelConfig

  /**
   * The logger instance.
   */
  protected readonly logger: WinstonLogger

  /**
   * Create a new console logger instance.
   *
   * @param options
   */
  constructor (options: LoggingChannelConfig) {
    this.config = options = options ?? {}

    this.logger = this.createLogger()
  }

  /**
   * Create a logger instance.
   *
   * @returns {Logger}
   */
  createLogger (): WinstonLogger {
    Winston.addColors(this.colors())

    return Winston.createLogger({
      levels: this.levels(),
      level: this.logLevel(),
      format: Winston.format.combine(
        this.handleErrorLogs()
      )
    })
  }

  /**
   * Returns the extended color palette containing the corresponding
   * colors for the added logging levels "emergency" and "critical".
   *
   * @returns {AbstractConfigSetColors}
   */
  colors (): AbstractConfigSetColors {
    return Object.assign({
      emergency: 'red',
      critical: 'red'
    }, Winston.config.syslog.colors)
  }

  /**
   * Returns the log level. Defaults to `debug`.
   */
  logLevel (): string {
    return this.config.level ?? 'debug'
  }

  /**
   * Returns an object of logging levels. Winston uses abbreviations for the
   * "emergency" and "critical" logs levels. The returned log levels extend
   * the default levels with full-named aliases.
   *
   * @returns {Object}
   */
  levels (): AbstractConfigSetLevels {
    return Object.assign({
      emergency: 0,
      critical: 2
    }, Winston.config.syslog.levels)
  }

  /**
   * The winston logger does not log error messages when passing
   * down error objects. When receiving an error instance, this
   * logger will handle it properly and show the stacktrace.
   *
   * @returns {Format}
   */
  handleErrorLogs (): any {
    const formatter = format(log => {
      return this.isError(log)
        ? Object.assign({ message: `${log.message}\n${log.stack}` }, log)
        : log
    })

    return formatter()
  }

  /**
   * Determine whether the given `log` item is an error.
   *
   * @param log
   *
   * @returns {Boolean}
   */
  isError (log: any): boolean {
    return log instanceof Error
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
