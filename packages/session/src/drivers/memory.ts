'use strict'

import { SessionDriver } from '@supercharge/contracts'
import { InteractsWithTime } from '@supercharge/support'

interface SessionEntry { time: number, data: any }

export class MemorySessionDriver extends InteractsWithTime implements SessionDriver {
  /**
   * Stores the session data.
   */
  private readonly sessions: Map<string, SessionEntry>

  /**
   * Stores the session config.
   */
  private readonly lifetimeInMinutes: number

  /**
   * Create a new memory session driver instance.
   */
  constructor (minutes: number) {
    super()

    this.lifetimeInMinutes = minutes
    this.sessions = new Map<string, any>()
  }

  /**
   * Read the session data.
   */
  async read (sessionId: string): Promise<Record<string, any> | undefined> {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return {}
    }

    const expiration = this.calculateExpiration(this.lifetimeInMinutes * 60)

    if (session.time >= expiration) {
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
      time: this.currentTime()
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

  /**
   * Returns the expiration time for the given `lifetime`.
   *
   * @param seconds
   */
  calculateExpiration (seconds: number): number {
    return this.currentTime() - seconds
  }
}
