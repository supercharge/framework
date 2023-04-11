'use strict'

import { InteractsWithTime } from '@supercharge/support'
import { SessionDriver, HttpContext } from '@supercharge/contracts'

interface SessionEntry { expires: number, data: any }

export class CookieSessionDriver extends InteractsWithTime implements SessionDriver {
  /**
   * Stores the HTTP context instance.
   */
  private readonly ctx: HttpContext

  /**
   * Stores the session lifetime in seconds.
   */
  private readonly lifetimeInSeconds: number

  /**
   * Create a new cookie session driver instance.
   *
   * @param {Number} lifetimeInSeconds
   * @param {HttpRequest} ctx
   */
  constructor (lifetimeInSeconds: number, ctx: HttpContext) {
    super()

    this.ctx = ctx
    this.lifetimeInSeconds = lifetimeInSeconds
  }

  /**
   * Read the session data.
   */
  async read (sessionId: string): Promise<Record<string, any>> {
    const value = this.ctx.request.cookie(sessionId) ?? ''

    if (!value) {
      return {}
    }

    const { data, expires } = JSON.parse(value) as SessionEntry

    if (this.now().getTime() <= expires) {
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

    this.ctx.response.cookies().set(sessionId, value)

    return this
  }

  /**
   * Delete the session data for the given `sessionId`.
   */
  async destroy (sessionId: string): Promise<this> {
    this.ctx.response.cookies().delete(sessionId)

    return this
  }
}
