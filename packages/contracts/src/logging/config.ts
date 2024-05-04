
export interface LoggingConfig {
  /**
   * The logging driver name.
   */
  driver: keyof this['channels']

  /**
   * The logging channels config.
   */
  channels: LoggingChannels
}

export interface LoggingChannels {
  /**
   * Stores the configuration for the file channel.
   */
  file?: FileChannelConfig

  /**
   * Stores the configuration for the console channel.
   */
  console?: ConsoleChannelConfig
}

export interface ConsoleChannelConfig extends LogChannelConfig {}

export interface FileChannelConfig extends LogChannelConfig {
  /**
   * The log file path.
   */
  path?: string
}

export interface LogChannelConfig {
  /**
   * The minimum logging level.
   */
  level?: string
}
