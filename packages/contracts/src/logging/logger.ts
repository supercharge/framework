'use strict'

export interface Logger {
  /**
   * Log the given `message` at debug level.
   *
   * @param message
   */
  debug (message: string, ...context: any[]): void

  /**
   * Log the given `message` at info level.
   *
   * @param message
   */
  info (message: string, ...context: any[]): void

  /**
   * Log the given `message` at trace level.
   *
   * @param message
   */
  notice (message: string, ...context: any[]): void

  /**
   * Log the given `message` at warn level.
   *
   * @param message
   */
  warning (message: string, ...context: any[]): void

  /**
   * Log the given `message` at error level.
   *
   * @param message
   */
  error (message: string, ...context: any[]): void

  /**
   * Log the given `message` at critical level.
   *
   * @param message
   */
  critical (message: string, ...context: any[]): void

  /**
   * Log the given `message` at alert level.
   *
   * @param message
   */
  alert (message: string, ...context: any[]): void

  /**
   * Log the given `message` at emergency level.
   *
   * @param message
   */
  emergency (message: string, ...context: any[]): void
}
