'use strict'

import { Session } from './session'
import { Manager } from '@supercharge/manager'
import { SessionConfig } from './session-config'
import { MemorySessionDriver } from './drivers/memory'
import { CookieSessionDriver } from './drivers/cookie'
import { Application, HttpContext, SessionDriver } from '@supercharge/contracts'

export class SessionManager extends Manager {
  /**
   * Stores the HTTP request instance. The cookie driver needs the request
   * instance to properly write the session values into the session cookie.
   */
  private ctx?: HttpContext

  /**
   * Create a new session manager instance.
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
   * @param {HttpContext} ctx
   *
   * @returns {Session}
   */
  createFrom (ctx: HttpContext): Session {
    if (ctx.state().has('session')) {
      return ctx.state().get('session') as Session
    }

    this.ctx = ctx

    const session = new Session(
      this.driver(), this.sessionConfig().name()
    )

    this.ctx.state().add('session', session)

    return session
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
  protected override driver (name: string = this.defaultDriver()): SessionDriver {
    if (name === 'cookie') {
    /**
     * We need to create a new cookie driver instance on every time the driver is
     * needed. The reason is, the cookie driver needs the related HTTP context.
     * A fresh driver receives the given HTTP context and can handle it all.
     */
      return this.createDriver(name).get(name)
    }

    return super.driver(name)
  }

  /**
   * Returns a cookie session driver instance.
   *
   * @returns {SessionDriver}
   */
  protected createCookieDriver (): SessionDriver {
    return new CookieSessionDriver(
      this.sessionConfig().lifetime(), this.ctx as HttpContext
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
