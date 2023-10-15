
import { Middleware } from './base'
import { HttpContext, NextHandler, ErrorHandler } from '@supercharge/contracts'

export class HandleErrorMiddleware extends Middleware {
  /**
   * Handle the incoming request.
   *
   * @param {HttpContext} ctx
   * @param {NextHandler} next
   */
  async handle (ctx: HttpContext, next: NextHandler): Promise<void> {
    try {
      await next()
    } catch (error: any) {
      await this.handleError(ctx, error)
    }
  }

  /**
   * Process the given `error` and HTTP `ctx` using the error handler.
   *
   * @param error
   * @param ctx
   */
  private async handleError (ctx: HttpContext, error: Error): Promise<void> {
    if (this.app.hasBinding('error.handler')) {
      return await this.app.make<ErrorHandler>('error.handler').handle(ctx, error)
    }

    throw error
  }
}
