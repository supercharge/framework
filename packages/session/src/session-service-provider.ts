'use strict'

import { SessionManager } from './session-manager'
import { ServiceProvider } from '@supercharge/support'
import { HttpRequest, Session } from '@supercharge/contracts'
import { StartSessionMiddleware } from './middleware/start-session'

/**
 * Add container bindings for the session service.
 */
export interface ContainerBindings {
  'session': SessionManager
}

/**
 * Extend the supercharge request interface with the session property.
 */
declare module '@supercharge/contracts' {
  export interface HttpRequest {
    session (): Session
  }
}

export class SessionServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  override register (): void {
    this.registerSessionManager()
    this.registerStartSessionMiddleware()
  }

  /**
   * Bind the session instance into the container.
   */
  private registerSessionManager (): void {
    this.app().singleton('session', () => {
      return new SessionManager(this.app())
    })
  }

  /**
   * Bind the middleware to start the session into the container.
   */
  private registerStartSessionMiddleware (): void {
    this.app().singleton(StartSessionMiddleware, () => {
      const manager = this.app().make('session')

      return new StartSessionMiddleware(manager)
    })
  }

  /**
   * Boot application services.
   */
  override async boot (): Promise<void> {
    this.registerRequestMacro()
  }

  /**
   * Register the `request.session()` macro function to the request constructor.
   */
  private registerRequestMacro (): void {
    const Request = this.app().make<HttpRequest>('request')
    const session = this.app().make<SessionManager>('session')

    Request.macro('session', function (this: HttpRequest) {
      return session.createFrom(this.ctx())
    })
  }
}
