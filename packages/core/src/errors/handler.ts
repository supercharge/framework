'use strict'

import Youch from 'youch'
import { HttpError } from './http-error'
import { tap } from '@supercharge/goodies'
import Collect from '@supercharge/collections'
import { Application, ErrorHandler as ErrorHandlerContract, HttpContext, Logger, ViewEngine } from '@supercharge/contracts'

export class ErrorHandler implements ErrorHandlerContract {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * Stores the list of report callbacks.
   */
  private readonly reportCallbacks: Array<(ctx: HttpContext, error: HttpError) => void | Promise<void>>

  /**
   * Create a new error handler instance.
   */
  constructor (app: Application) {
    this.app = app
    this.reportCallbacks = []

    this.register()
  }

  /**
   * The application’s logger instance.
   */
  logger (): Logger {
    return this.app.logger()
  }

  /**
   * The application’s view renderer.
   */
  view (): ViewEngine {
    return this.app.make('view')
  }

  /**
   * Register the error handling callbacks. For example, to report error
   * upstream to an error tracking service, like Sentry or Bugsnag.
   */
  register (): void {
    /**
     * We’re registering a default reportable handler here that logs the error
     * message and context to the default logging transport. This "register"
     * method should be overwritten in user-land to remove this default.
     */
    this.reportable((ctx, error) => {
      this.logger().error(error.message, { ...this.context(ctx), error })
    })
  }

  /**
   * Register a reportable callback.
   *
   * @param  {Function} reportUsing
   *
   * @returns {ErrorHandler}
   */
  reportable (reportUsing: (ctx: HttpContext, error: HttpError) => void | Promise<void>): ErrorHandler {
    return tap(this, () => {
      this.reportCallbacks.push(reportUsing)
    })
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
   *
   * @param {HttpContext} ctx
   * @param {Error} error
   */
  async handle (ctx: HttpContext, error: Error): Promise<void> {
    const httpError = HttpError.wrap(error)

    await this.report(ctx, httpError)
    await this.render(ctx, httpError)
  }

  /**
   * Report an error.
   *
   * @param {HttpContext} ctx
   * @param {HttpError} error
   */
  async report (ctx: HttpContext, error: HttpError): Promise<void> {
    await Collect(this.reportCallbacks).forEach(async reportCallback => {
      await reportCallback(ctx, error)
    })
  }

  /**
   * Render the error into an HTTP response.
   *
   * @param {HttpContext} ctx
   * @param {HttpError} error
   */
  async render (ctx: HttpContext, error: HttpError): Promise<any> {
    if (ctx.request.wantsJson()) {
      return this.renderJsonResponse(ctx, error)
    }

    if (this.app.env().isProduction()) {
      return this.renderJsonResponse(ctx, error)
    }

    return await this.renderViewResponse(ctx, error)
  }

  /**
   * Creates a JSON response depending on the app’s environment.
   *
   * @param {HttpContext} ctx
   * @param {HttpError} error
   */
  protected renderJsonResponse (ctx: HttpContext, error: HttpError): void {
    const { message, stack, status: statusCode } = error

    this.app.env().isProduction()
      ? ctx.response.status(statusCode).payload({ message, statusCode })
      : ctx.response.status(statusCode).payload({ message, statusCode, stack })
  }

  /**
   * Creates an HTML response depending on the app’s environment.
   *
   * @param {HttpContext} ctx
   * @param {HttpError} error
   */
  protected async renderViewResponse (ctx: HttpContext, error: HttpError): Promise<void> {
    if (await this.isMissingTemplateFor(error)) {
      return await this.renderYouchResponse(ctx, error)
    }

    await ctx.response.status(error.status).view(
      this.viewTemplateFor(error), { error }
    )
  }

  /**
   * Determine whether a view template file is missing for the given `error`.
   *
   * @param {HttpError} error
   *
   * @returns {Boolean}
   */
  protected async isMissingTemplateFor (error: HttpError): Promise<boolean> {
    return !await this.templateExistsFor(error)
  }

  /**
   * Determine whether a view template file exists for the given `error`.
   *
   * @param {HttpError} error
   *
   * @returns {Boolean}
   */
  protected async templateExistsFor (error: HttpError): Promise<boolean> {
    return await this.view().exists(
      this.viewTemplateFor(error)
    )
  }

  /**
   * Returns the view template file for the given `error`.
   *
   * @param {HttpError} error
   *
   * @returns {String}
   */
  protected viewTemplateFor (error: HttpError): string {
    return `errors/${error.status}`
  }

  /**
   * Renders an HTML response containing details about the given `error`.
   *
   * @param {HttpContext} ctx
   * @param {HttpError} error
   */
  async renderYouchResponse ({ request, response }: HttpContext, error: HttpError): Promise<void> {
    response.payload(
      await new Youch(error, request.req()).toHTML()
    ).status(error.status)
  }
}
