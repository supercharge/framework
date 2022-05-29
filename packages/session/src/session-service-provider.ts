'use strict'

import { HttpRequest } from '@supercharge/contracts'
import { ServiceProvider } from '@supercharge/support'

// export interface ContainerBindings {
//   'route': Router
//   'router': Router
// }

export class SessionServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  override register (): void {
    this.app().singleton('session', () => {
      return new SessionManager(this.app().config().get('session'))
    })
  }

  override async boot (): Promise<void> {
    //
    this.registerRequestMacro()
  }

  private registerRequestMacro (): void {
    const Request = this.app().make<HttpRequest>('request')

    Request.macro('session', function () {
      return Session.from(this)
    })
  }
}
