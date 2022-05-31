'use strict'

import { SessionDriver, SessionConfig } from '@supercharge/contracts'

export class CookieSessionDriver implements SessionDriver {
  private readonly config: SessionConfig

  /**
   * Create a new view manager instance.
   *
   * @param {SessionConfig} config
   */
  constructor (config: SessionConfig) {
    this.config = config
  }

  async read (sessionId: string): Promise<Record<string, any> | undefined> {
    throw new Error('Method not implemented.')
  }

  async write (sessionId: string, values: Record<string, any>): Promise<this> {
    throw new Error('Method not implemented.')
  }

  async destroy (sessionId: string): Promise<this> {
    throw new Error('Method not implemented.')
  }

  async touch (sessionId: string): Promise<this> {
    throw new Error('Method not implemented.')
  }
}
