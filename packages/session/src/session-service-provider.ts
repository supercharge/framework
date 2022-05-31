'use strict'

import { SessionManager } from './session-manager'
import { HttpRequest } from '@supercharge/contracts'
import { ServiceProvider } from '@supercharge/support'

export interface ContainerBindings {
  'session': SessionManager
}

export class SessionServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  override register (): void {
    this.registerSessionManager()
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
      return session.from(this)
    })
  }
}
