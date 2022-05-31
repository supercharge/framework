'use strict'

import { SessionDriver, SessionConfig, HttpRequest } from '@supercharge/contracts'

export class CookieSessionDriver implements SessionDriver {
  /**
   * Stores the request instance.
   */
  private readonly request: HttpRequest

  /**
   * Stores the session config.
   */
  private readonly config: SessionConfig

  /**
   * Create a new cookie session driver instance.
   *
   * @param {HttpRequest} config
   * @param {SessionConfig} config
   */
  constructor (config: SessionConfig, request: HttpRequest) {
    this.config = config
    this.request = request
  }

  /**
   * Read the session data.
   */
  async read (sessionId: string): Promise<Record<string, any> | undefined> {
    const value = this.request.cookie(sessionId)

    // TODO

    return {}
  }

  /**
   * Store the session data.
   */
  async write (sessionId: string, values: Record<string, any>): Promise<this> {
    const value = JSON.stringify(values)

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
