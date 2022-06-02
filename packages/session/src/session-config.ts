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
      throw new Error('Session cookie "name" is required. Configure it in your "config/session.ts" file.')
    }

    return name
  }

  /**
   * Returns the session cookie lifetime in seconds.
   */
  lifetime (): number {
    const lifetime = this.config.lifetime

    if (typeof lifetime === 'string') {
      return ms(lifetime) * 1000
    }

    if (typeof lifetime === 'number') {
      return lifetime
    }

    throw new Error(`Session lifetime value is neither a string nor a number. Received "${typeof lifetime}". Configure it in your "config/session.ts" file.`)
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
