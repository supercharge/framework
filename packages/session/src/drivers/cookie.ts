'use strict'

import { InteractsWithTime } from '@supercharge/support'
import { SessionDriver, HttpRequest } from '@supercharge/contracts'

interface SessionEntry { expires: number, data: any }

export class CookieSessionDriver extends InteractsWithTime implements SessionDriver {
  /**
   * Stores the request instance.
   */
  private readonly request: HttpRequest

  /**
   * Stores the session lifetime in seconds.
   */
  private readonly lifetimeInSeconds: number

  /**
   * Create a new cookie session driver instance.
   *
   * @param {Number} seconds
   * @param {HttpRequest} request
   */
  constructor (seconds: number, request: HttpRequest) {
    super()

    this.request = request
    this.lifetimeInSeconds = seconds
  }

  /**
   * Read the session data.
   */
  async read (sessionId: string): Promise<Record<string, any>> {
    const value = this.request.cookie(sessionId) ?? ''

    if (!value) {
      return {}
    }

    const { data, expires } = JSON.parse(value) as SessionEntry

    if (this.currentTime() <= expires) {
      return data
    }

    return {}
  }

  /**
   * Store the session data.
   */
  async write (sessionId: string, data: Record<string, any>): Promise<this> {
    const value = JSON.stringify({
      data,
      expires: this.availableAt(this.lifetimeInSeconds)
    })

    this.request.cookies().set(sessionId, value)

    return this
  }

  /**
   * Delete the session data for the given `sessionId`.
   */
  async destroy (sessionId: string): Promise<this> {
    this.request.cookies().delete(sessionId)

    return this
  }
}
