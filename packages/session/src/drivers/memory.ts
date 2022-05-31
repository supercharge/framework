'use strict'

import { SessionDriver } from '@supercharge/contracts'

export class MemorySessionDriver implements SessionDriver {
  /**
   * Stores the session data.
   */
  private readonly sessions: Map<string, any>

  /**
   * Create a new memory session driver instance.
   */
  constructor () {
    this.sessions = new Map<string, any>()
  }

  /**
   * Read the session data.
   */
  async read (sessionId: string): Promise<Record<string, any> | undefined> {
    return this.sessions.get(sessionId)
  }

  /**
   * Store the session data.
   */
  async write (sessionId: string, values: Record<string, any>): Promise<this> {
    this.sessions.set(sessionId, values)

    return this
  }

  /**
   * Delete the session data for the given `sessionId`.
   */
  async destroy (sessionId: string): Promise<this> {
    this.sessions.delete(sessionId)

    return this
  }
}
