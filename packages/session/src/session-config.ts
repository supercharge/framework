'use strict'

import ms from 'ms'
import { SessionCookieConfig } from './session-config-cookie'
import { SessionConfig as SessionConfigContract } from '@supercharge/contracts'

export class SessionConfig {
  /**
   * Stores the session config object.
   */
  private readonly config: SessionConfigContract

  /**
   * Create a new instance.
   */
  constructor (config: SessionConfigContract) {
    this.config = config
  }

  /**
   * Returns the session config as a plain JavaScript object.
   */
  plain (): SessionConfigContract {
    return this.config
  }

  /**
   * Returns the session driver name.
   */
  driver (): string {
    return this.config.driver ?? ''
  }

  /**
   * Returns the session cookie name.
   */
  name (): string {
    const name = this.config.name

    if (!name) {
      throw new Error(`Session cookie "name" is required. Received "${name}". Configure it in your "config/session.ts" file.`)
    }

    return name
  }

  /**
   * Returns the file system path for session files.
   */
  fileLocation (): string {
    const location = this.config.file?.location

    if (location) {
      return location
    }

    throw new Error(`Session file "location" value is not configured. Received "${typeof location}". Configure it in your "config/session.ts" file.`)
  }

  /**
   * Returns the session cookie lifetime in **seconds**.
   */
  lifetime (): number {
    const lifetime = this.config.lifetime

    if (typeof lifetime === 'string') {
      return this.lifetimeInSecondsFrom(lifetime)
    }

    if (typeof lifetime === 'number') {
      return lifetime
    }

    throw new Error(`Session lifetime value is neither a string nor a number. Received "${typeof lifetime}". Configure it in your "config/session.ts" file.`)
  }

  /**
   * Determine whether to clear the session when the browser closes.
   */
  expiresOnClose (): boolean {
    return this.config.expireOnClose ?? false
  }

  /**
   * Returns the session cookie lifetime in **seconds** calculated from the given `milliseconds`
   */
  private lifetimeInSecondsFrom (lifetime: string): number {
    const milliseconds = ms(lifetime)

    if (milliseconds) {
      return milliseconds / 1000
    }

    throw new Error(`Invalid session lifetime value. Received "${lifetime}". Configure it in your "config/session.ts" file.`)
  }

  /**
   * Returns the session name.
   */
  cookie (): SessionCookieConfig {
    return new SessionCookieConfig(
      this.config.cookie
    )
  }
}
