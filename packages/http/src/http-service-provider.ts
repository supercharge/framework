'use strict'

import { Server } from './server'
import { Router } from './routing'
import { Request } from './server/request'
import { Response } from './server/response'
import { ServiceProvider } from '@supercharge/support'
import { ApplicationConfig, HttpConfig } from '@supercharge/contracts'

export interface ContainerBindings {
  'route': Router
  'router': Router
  'server': Server
  Server: Server
  Request: typeof Request
  Response: typeof Response
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
      .bind('server', () => {
        const appConfig = this.config().get<ApplicationConfig>('app')

        return new Server(this.app(), appConfig, this.httpConfig())
      })
      .alias('server', 'http.server')
      .alias('server', Server)
  }

  /**
   * Bind the Router instance into the container.
   */
  private bindRouter (): void {
    this.app()
      .singleton('route', () => new Router(this.app(), this.httpConfig()))
      .alias('route', 'router')
  }

  /**
   * Returns the HTTP configuration object.
   */
  private httpConfig (): HttpConfig {
    return this.config().get('http')
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

  /**
   * Stop application services.
   */
  override async shutdown (): Promise<void> {
    await this.app().make<Server>('server').stop()
  }
}
