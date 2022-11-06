'use strict'

import { SessionManager } from '../session-manager'
import { InteractsWithTime } from '@supercharge/support'
import { Session, HttpContext, HttpResponse, NextHandler, HttpRequest } from '@supercharge/contracts'

export class StartSessionMiddleware extends InteractsWithTime {
  /**
   * Stores the session manager instance.
   */
  private readonly sessionManager: SessionManager

  /**
   * Create a new middleware instance.
   */
  constructor (manager: SessionManager) {
    super()

    this.sessionManager = manager
  }

  /**
   * Handle the incoming request.
   *
   * @param {HttpContext} ctx
   * @param {NextHandler} next
   */
  async handle ({ request, response }: HttpContext, next: NextHandler): Promise<void> {
    const session = await this.startSession(request)

    await next()

    this.addSessionCookieToResponse(session, response)

    await session.commit()
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
  addSessionCookieToResponse (session: Session, response: HttpResponse): void {
    response.cookie(session.name(), session.id(), cookie => {
      cookie
        .useConfig(this.sessionManager.sessionConfig().cookie().plain())
        .expiresAt(this.cookieExpirationDate())
    })
  }

  /**
   * Returns the session cookie expiration date.
   */
  protected cookieExpirationDate (): Date {
    const config = this.sessionManager.sessionConfig()

    if (config.expiresOnClose()) {
      return this.now()
    }

    return this.addSecondsDelay(
      this.now(), config.lifetime()
    )
  }
}
