'use strict'

import { Session } from './session'
import { Manager } from '@supercharge/manager'
import { SessionConfig } from './session-config'
import { MemorySessionDriver } from './drivers/memory'
import { CookieSessionDriver } from './drivers/cookie'
import { Application, HttpRequest, SessionDriver } from '@supercharge/contracts'

export class SessionManager extends Manager {
  /**
   * Stores the HTTP request instance. The cookie driver needs the request
   * instance to properly write the session values into the session cookie.
   */
  private request?: HttpRequest

  /**
   * Create a new view manager instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    super(app)

    this.validateConfig()
  }

  /**
   * Validate the view config.
   *
   * @throws
   */
  private validateConfig (): void {
    this.ensureConfig('session', () => {
      throw new Error('Missing session configuration file. Make sure the "config/session.ts" file exists.')
    })

    this.ensureConfig('session.driver')
  }

  /**
   * Returns the session config.
   */
  sessionConfig (): SessionConfig {
    return new SessionConfig(
      this.config().get('session')
    )
  }

  /**
   * Returns a new session instance for the given `request`.
   *
   * @param {HttpRequest} request
   *
   * @returns {Session}
   */
  from (request: HttpRequest): Session {
    this.request = request

    return new Session(
      this.driver(), this.sessionConfig().name()
    )
  }

  /**
   * Returns the default driver name.
   *
   * @returns {String}
   */
  defaultDriver (): string {
    return this.config().get('session.driver')
  }

  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   *
   * @param {String} name
   *
   * @returns {SessionDriver}
   */
  protected override driver (name?: string): SessionDriver {
    return super.driver(name)
  }

  /**
   * Returns a cookie session driver instance.
   *
   * @returns {SessionDriver}
   */
  protected createCookieDriver (): SessionDriver {
    return new CookieSessionDriver(
      this.sessionConfig().lifetime(), this.request as HttpRequest
    )
  }

  /**
   * Returns a memory session driver instance.
   *
   * @returns {SessionDriver}
   */
  protected createMemoryDriver (): SessionDriver {
    return new MemorySessionDriver(
      this.sessionConfig().lifetime()
    )
  }
}
