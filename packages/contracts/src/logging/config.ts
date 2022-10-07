'use strict'

export interface LoggingConfig {
  /**
   * The logging driver name.
   */
  driver: string

  /**
   * The logging channels config.
   */
  channels: LoggingChannels
}

export interface LoggingChannels {
  /**
   * The file channel.
   */
  file: FileChannelConfig

  /**
   * The console channel.
   */
  console: ConsoleChannelConfig

  /**
   * Index signature for other channels.
   */
  [key: string]: LogChannelConfig & Record<string, any>
}

export interface ConsoleChannelConfig extends LogChannelConfig {}

export interface FileChannelConfig extends LogChannelConfig {
  /**
   * The log file path.
   */
  path: string
}

export interface LogChannelConfig {
  /**
   * The minimum logging level.
   */
  level: string
}
