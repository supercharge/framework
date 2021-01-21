'use strict'

import { Application, ErrorHandler as ErrorHandlerContract, HttpContext, Logger } from '@supercharge/contracts'

export class ErrorHandler implements ErrorHandlerContract {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * Create a new error handler instance.
   */
  constructor (app: Application) {
    this.app = app
  }

  /**
   * The application’s logger instance.
   */
  logger (): Logger {
    return this.app.logger()
  }

  /**
   * Handle the given error.
   */
  async handle (ctx: HttpContext, error: Error): Promise<void> {
    await this.report(ctx, error)
    await this.render(ctx, error)
  }

  /**
   * Report an error.
   */
  report (_ctx: HttpContext, error: Error): void | Promise<void> {
    this.logger().error(error.message, error)
  }

  /**
   * Render an error into an HTTP response.
   */
  async render (ctx: HttpContext, error: Error): Promise<any> {
    // TODO

    return ctx.request.wantsJson()
      ? this.renderJsonResponse(ctx, error)
      : this.renderViewResponse(ctx, error)
  }

  renderJsonResponse (_ctx: HttpContext, _error: Error): void {
    // TODO
  }

  renderViewResponse (_ctx: HttpContext, _error: Error): void {
    // TODO
  }
}
