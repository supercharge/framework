'use strict'

import { SessionManager } from '../session-manager'
import { Session, HttpContext, HttpResponse, NextHandler, HttpRequest } from '@supercharge/contracts'

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
  async handle ({ request, response }: HttpContext, next: NextHandler): Promise<void> {
    if (this.isMissingSessionDriver()) {
      return next()
    }

    const session = await this.startSession(request)

    await next()

    await this.addSessionCookieToResponse(session, response)

    await session.commit()
  }

  /**
   * Determine whether a valid session driver is configured.
   */
  isMissingSessionDriver (): boolean {
    return this.sessionManager.sessionConfig().driver() === ''
  }

  /**
   * Returns a started session for the given request.
   */
  async startSession (request: HttpRequest): Promise<Session> {
    const session = request.session()
    const sessionId = request.cookie(session.name()) as string

    return await session
      .setId(sessionId)
      .start()
  }

  /**
   * Save the session data to storage.
   *
   * @param {HttpRequest} request
   */
  async addSessionCookieToResponse (session: Session, response: HttpResponse): Promise<void> {
    response.cookie(session.name(), session.id(), cookie => {
      cookie.useConfig(this.sessionManager.sessionConfig().cookie().plain())
    })
  }
}
