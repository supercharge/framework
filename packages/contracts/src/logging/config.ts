'use strict'

export interface LoggingConfig {
  /**
   * The logging driver name.
   */
  driver: string

  /**
   * The logging channels config.
   */
  channels: Record<string, LogChannelConfig & Record<string, any>>
}

export interface LogChannelConfig {
  /**
   * The minimum logging level.
   */
  level: string
}
