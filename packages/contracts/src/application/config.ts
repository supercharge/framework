'use strict'

export interface ApplicationConfig {
  /**
   * The application name.
   */
  name: string

  /**
   * The application key, used to encrypt data.
   */
  key: string

  /**
   * The application description.
   */
  description?: string

  /**
   * The application environment.
   */
  env?: string

  /**
   * The application version.
   */
  version?: string

  /**
   * Determine whether the application runs behind a proxy server.
   */
  runsBehindProxy?: boolean
}
