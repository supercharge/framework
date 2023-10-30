
import { Session } from './session.js'
import { Manager } from '@supercharge/manager'
import { SessionConfig } from './session-config.js'
import { FileSessionDriver } from './drivers/file.js'
import { MemorySessionDriver } from './drivers/memory.js'
import { CookieSessionDriver } from './drivers/cookie.js'
import { Application, HttpContext, SessionDriver } from '@supercharge/contracts'

/**
 * Add HTTP state bindings for the session.
 */
declare module '@supercharge/contracts' {
  export interface HttpStateData {
    'session': Session | undefined
  }
}

export class SessionManager extends Manager<Application> {
  /**
   * Stores the HTTP request instance. The cookie driver needs the request
   * instance to properly write the session values into the session cookie.
   */
  private ctx?: HttpContext

  /**
   * Create a new session manager instance.
   */
  constructor (app: Application) {
    super(app)

    this.validateConfig()
  }

  /**
   * Validate the view config.
   */
  private validateConfig (): void {
    this.app.config().ensure('session', () => {
      throw new Error('Missing session configuration file. Make sure the "config/session.ts" file exists.')
    })

    this.app.config().ensureNotEmpty('session.driver', () => {
      throw new Error('Missing session driver. Make sure to configure it in the "config/session.ts" file.')
    })
  }

  /**
   * Returns the session config.
   */
  sessionConfig (): SessionConfig {
    return new SessionConfig(
      this.app.config().get('session')
    )
  }

  /**
   * Returns a new session instance for the given `request`.
   */
  createFrom (ctx: HttpContext): Session {
    const existingSession = ctx.state().get('session')

    if (existingSession) {
      return existingSession
    }

    this.ctx = ctx

    const sessionName = this.sessionConfig().name()
    const sessionId = ctx.request.cookie(sessionName)
    const session = new Session(this.driver(), sessionName, sessionId)

    this.ctx.state().set('session', session)

    return session
  }

  /**
   * Returns the default driver name.
   */
  defaultDriver (): string {
    return this.sessionConfig().driver()
  }

  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   */
  protected override driver (name: string = this.defaultDriver()): SessionDriver {
    if (name === 'cookie') {
    /**
     * We need to create a new cookie driver instance on every time the driver is
     * needed. The reason is, the cookie driver needs the related HTTP context.
     * A fresh driver receives the given HTTP context and can handle it all.
     */
      return this.createDriver(name).fromCache(name)
    }

    return super.driver(name)
  }

  /**
   * Returns a cookie session driver instance.
   */
  protected createCookieDriver (): SessionDriver {
    return new CookieSessionDriver(
      this.sessionConfig().lifetime(), this.ctx as HttpContext
    )
  }

  /**
   * Returns a memory session driver instance.
   */
  protected createMemoryDriver (): SessionDriver {
    return new MemorySessionDriver(
      this.sessionConfig().lifetime()
    )
  }

  /**
   * Returns a file session driver instance.
   */
  protected createFileDriver (): SessionDriver {
    return new FileSessionDriver(
      this.sessionConfig().lifetime(),
      this.sessionConfig().fileLocation(),
    )
  }
}
