
export interface Logger {
  /**
   * Log the given `message` at debug level.
   */
  debug (message: string, ...context: any[]): void

  /**
   * Log the given `message` at info level.
   */
  info (message: string, ...context: any[]): void

  /**
   * Log the given `message` at trace level.
   */
  notice (message: string, ...context: any[]): void

  /**
   * Log the given `message` at warn level.
   */
  warning (message: string, ...context: any[]): void

  /**
   * Log the given `message` at error level.
   */
  error (message: string, ...context: any[]): void

  /**
   * Log the given `message` at critical level.
   */
  critical (message: string, ...context: any[]): void

  /**
   * Log the given `message` at alert level.
   */
  alert (message: string, ...context: any[]): void

  /**
   * Log the given `message` at emergency level.
   */
  emergency (message: string, ...context: any[]): void
}
