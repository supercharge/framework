'use strict'

import { Manager } from '@supercharge/manager'
import { Application, HttpRequest, SessionConfig, SessionDriver } from '@supercharge/contracts'
import { CookieSessionDriver } from './drivers/cookie'
import { Session } from './session'

export class SessionManager extends Manager {
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
  private sessionConfig (): SessionConfig {
    return this.config().get('session')
  }

  /**
   * Returns a new session instance for the given `request`.
   *
   * @param {HttpRequest} request
   *
   * @returns {Session}
   */
  from (request: HttpRequest): Session {
    return new Session()
  }

  /**
   * Returns the default driver name.
   *
   * @returns {String}
   */
  defaultDriver (): string {
    return this.config().get('view.driver')
  }

  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   *
   * @param {String} name
   *
   * @returns {ViewEngine}
   */
  protected override driver (name?: string): SessionDriver {
    return super.driver(name)
  }

  /**
   * Create a Handlebars view renderer instance.
   *
   * @returns {ViewEngine}
   */
  protected createCookieDriver (): SessionDriver {
    return new CookieSessionDriver(
      // this.sessionConfig()
    )
  }
}
