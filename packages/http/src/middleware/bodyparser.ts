'use strict'

import Set from '@supercharge/set'
import JSON from '@supercharge/json'
import { Application, BodyparserOptions, HttpContext, HttpRequest, Middleware, NextHandler } from '@supercharge/contracts'

export class Bodyparser implements Middleware {
  /**
   * The application instance.
   */
  protected readonly app: Application

  /**
   * Create a new middleware instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.app = app
  }

  /**
   * Returns the options determining how to serve assets.
   *
   * @returns {CorsOptions}
   */
  config (): BodyparserOptions {
    return this.app.config().get('bodyparser')
  }

  /**
   * Handle the incoming request.
   *
   * @param ctx HttpContext
   * @param next NextHandler
   */
  async handle (ctx: HttpContext, next: NextHandler): Promise<void> {
    if (this.shouldParseInput(ctx.request)) {
      return await next()
    }

    await next()
  }

  shouldParseInput (request: HttpRequest): boolean {
    return this.methods().includes(
      request.method().toUpperCase()
    )
  }

  private methods (): Set<string> {
    return Set.of([...this.config().methods])
  }

  async parseJson (request: HttpRequest): Promise<any> {
    const body = await this.collectBodyFrom(request)

    return JSON.parse(
      body.toString()
    )
  }

  async parseText (request: HttpRequest): Promise<any> {
    const body = await this.collectBodyFrom(request)

    return body.toString()
  }

  async collectBodyFrom (request: HttpRequest): Promise<any> {
    let body = ''

    for await (const chunk of request) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      body += chunk
    }

    return body
  }
}
