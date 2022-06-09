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

    this.config().ensureNotEmpty('session.driver', () => {
      throw new Error('Missing session driver. Make sure to configure it in the "config/session.ts" file.')
    })
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
  createFrom (request: HttpRequest): Session {
    this.request = request

    const session = new Session(
      this.driver(), this.sessionConfig().name()
    )

    const state = this.request.state()

    if (state.isMissing('session')) {
      state.add('session', session)
    }

    return state.get('session') as Session
  }

  /**
   * Returns the default driver name.
   *
   * @returns {String}
   */
  defaultDriver (): string {
    return this.sessionConfig().driver()
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
