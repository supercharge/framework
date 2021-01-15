'use strict'

import { ErrorHandler as ErrorHandlerContract, HttpContext } from '@supercharge/contracts'

export class ErrorHandler implements ErrorHandlerContract {
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

  report (_ctx: HttpContext, _error: Error): void | Promise<void> {
    // TODO send error to logger?
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
