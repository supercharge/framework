'use strict'

import { HttpContext, NextHandler } from '@supercharge/contracts'
import { SessionManager } from '../session-manager'

export class StartSessionMiddleware {
  /**
   * Stores the session manager instance.
   */
  private readonly sessionManager: SessionManager

  /**
   * Create a new middleware instance.
   */
  constructor (manager: SessionManager) {
    this.sessionManager = manager
  }

  /**
   * Handle the incoming request.
   *
   * @param {HttpContext} ctx
   * @param {NextHandler} next
   */
  async handle (_ctx: HttpContext, next: NextHandler): Promise<void> {
    await next()
  }
}
