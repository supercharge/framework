'use strict'

import { HttpError } from './http-error'
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
   * Returns the default logging context.
   *
   * @param {HttpContext} ctx
   *
   * @returns {*}
   */
  context (_ctx: HttpContext): any {
    return {}
  }

  /**
   * Handle the given error.
   */
  async handle (ctx: HttpContext, error: any): Promise<void> {
    const httpError = HttpError.wrap(error)

    await this.report(ctx, httpError)
    await this.render(ctx, httpError)
  }

  /**
   * Report an error.
   */
  report (ctx: HttpContext, error: HttpError): void | Promise<void> {
    this.logger().error(error.message, { ...this.context(ctx), error })
  }

  /**
   * Render an error into an HTTP response.
   */
  async render (ctx: HttpContext, error: HttpError): Promise<any> {
    return ctx.request.wantsJson()
      ? this.renderJsonResponse(ctx, error)
      : await this.renderViewResponse(ctx, error)
  }

  /**
   * Creates a JSON response depending on the app’s environment.
   *
   * @param {HttpContext} ctx
   * @param {*} error
   */
  renderJsonResponse (ctx: HttpContext, error: HttpError): void {
    const { message, stack, statusCode } = error

    this.app.env().isProduction()
      ? ctx.response.status(statusCode).payload({ message })
      : ctx.response.status(statusCode).payload({ message, stack, statusCode })
  }

  /**
   * Creates an HTML response depending on the app’s environment.
   *
   * @param {HttpContext} ctx
   * @param {*} error
   */
  async renderViewResponse (ctx: HttpContext, error: HttpError): Promise<void> {
    const { statusCode } = error

    await ctx.response.status(statusCode).view(`errors/${statusCode}`, { error })
  }
}
