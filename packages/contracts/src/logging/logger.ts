'use strict'

export interface Logger {
  /**
   * Log the given `message` at trace level.
   *
   * @param message
   */
  trace (message: string): void

  /**
   * Log the given `message` at debug level.
   *
   * @param message
   */
  debug (message: string): void

  /**
   * Log the given `message` at info level.
   *
   * @param message
   */
  info (message: string): void

  /**
   * Log the given `message` at warn level.
   *
   * @param message
   */
  warn (message: string): void

  /**
   * Log the given `message` at error level.
   *
   * @param message
   */
  error (message: string): void

  /**
   * Log the given `message` at fatal level.
   *
   * @param message
   */
  fatal (message: string): void
}
