'use strict'

import { Server } from './server'
import { Router } from './routing'
import { Request } from './server/request'
import { Response } from './server/response'
import { ServiceProvider } from '@supercharge/support'

export interface ContainerBindings {
  'route': Router
  'router': Router
  'server': Server
}

export class HttpServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  override register (): void {
    this.bindServer()
    this.bindRouter()
    this.bindRequest()
    this.bindResponse()
  }

  /**
   * Bind the Router instance into the container.
   */
  private bindServer (): void {
    this.app()
      .singleton('server', () => new Server(this.app()))
      .alias('server', Server)
  }

  /**
   * Bind the Router instance into the container.
   */
  private bindRouter (): void {
    this.app()
      .singleton('route', () => new Router(this.app()))
      .alias('route', 'router')
  }

  /**
   * Bind the Request constructor into the container.
   */
  private bindRequest (): void {
    this.app()
      .singleton('request', () => Request)
      .alias('request', Request)
  }

  /**
   * Bind the Response constructor into the container.
   */
  private bindResponse (): void {
    this.app()
      .singleton('response', () => Response)
      .alias('response', Response)
  }
}
