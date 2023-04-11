'use strict'

import { SessionDriver } from '@supercharge/contracts'
import { InteractsWithTime } from '@supercharge/support'

interface SessionEntry { expires: number, data: any }

export class MemorySessionDriver extends InteractsWithTime implements SessionDriver {
  /**
   * Stores the session data.
   */
  private readonly sessions: Map<string, SessionEntry>

  /**
   * Stores the session lifetime in seconds.
   */
  private readonly lifetimeInSeconds: number

  /**
   * Create a new memory session driver instance.
   */
  constructor (lifetimeInSeconds: number) {
    super()

    this.lifetimeInSeconds = lifetimeInSeconds
    this.sessions = new Map<string, any>()
  }

  /**
   * Read the session data.
   */
  async read (sessionId: string): Promise<Record<string, any>> {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return {}
    }

    if (this.now().getTime() <= session.expires) {
      return session.data
    }

    return {}
  }

  /**
   * Store the session data.
   */
  async write (sessionId: string, data: Record<string, any>): Promise<this> {
    this.sessions.set(sessionId, {
      data,
      expires: this.availableAt(this.lifetimeInSeconds)
    })

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
