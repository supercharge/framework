'use strict'

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
    return this.app.make('supercharge/view')
  }

  /**
   * Register the error handling callbacks. For example, to report error
   * upstream to an error tracking service, like Sentry or Bugsnag.
   */
  register (): void {
    //
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
   */
  async handle (ctx: HttpContext, error: any): Promise<void> {
    const httpError = HttpError.wrap(error)

    await this.report(ctx, httpError)
    await this.render(ctx, httpError)
  }

  /**
   * Report an error.
   */
  async report (ctx: HttpContext, error: HttpError): Promise<void> {
    await Collect(this.reportCallbacks).forEach(async reportCallback => {
      await reportCallback(ctx, error)
    })

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
    if (await this.isMissingTemplateFor(error)) {
      this.logger().debug(`No error view template found at "${this.viewTemplateFor(error)}". Falling back to JSON response.`)

      return this.renderJsonResponse(ctx, error)
    }

    await ctx.response
      .status(error.statusCode)
      .view(
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
  private async isMissingTemplateFor (error: HttpError): Promise<boolean> {
    return !await this.templateExistsFor(error)
  }

  /**
   * Determine whether a view template file exists for the given `error`.
   *
   * @param {HttpError} error
   *
   * @returns {Boolean}
   */
  private async templateExistsFor (error: HttpError): Promise<boolean> {
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
  private viewTemplateFor (error: HttpError): string {
    return `errors/${error.statusCode}`
  }
}
