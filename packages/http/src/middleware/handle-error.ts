
import { Middleware } from './base.js'
import { HttpContext, NextHandler, ErrorHandler } from '@supercharge/contracts'

export class HandleErrorMiddleware extends Middleware {
  /**
   * Handle the incoming request.
   */
  async handle (ctx: HttpContext, next: NextHandler): Promise<void> {
    try {
      await next()
    } catch (error: any) {
      await this.handleError(error, ctx)
    }
  }

  /**
   * Process the given `error` and HTTP `ctx` using the error handler.
   */
  private async handleError (error: Error, ctx: HttpContext): Promise<void> {
    if (this.app.hasBinding('error.handler')) {
      return await this.app.make<ErrorHandler>('error.handler').handle(error, ctx)
    }

    throw error
  }
}
