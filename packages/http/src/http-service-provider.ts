'use strict'

import { Router } from './routing'
import { Request } from './server/request'
import { Response } from './server/response'
import { ServiceProvider } from '@supercharge/support'

export interface ContainerBindings {
  'route': Router
  'router': Router
}

export class HttpServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  override register (): void {
    this.bindRouter()
    this.bindRequest()
    this.bindResponse()
  }

  /**
   * Bind the Router instance into the container.
   */
  private bindRouter (): void {
    this.app().singleton('route', () => {
      return new Router(this.app())
    })

    this.app().singleton('router', () => {
      return this.app().make('route')
    })
  }

  /**
   * Bind the Request constructor into the container.
   */
  private bindRequest (): void {
    this.app().singleton('request', () => Request)
    this.app().singleton(Request, () => Request)
  }

  /**
   * Bind the Response constructor into the container.
   */
  private bindResponse (): void {
    this.app().singleton('response', () => Response)
    this.app().singleton(Response, () => Response)
  }
}
