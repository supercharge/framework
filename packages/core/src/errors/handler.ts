
import Youch from 'youch'
import { HttpError } from './http-error'
import { tap } from '@supercharge/goodies'
import Collect from '@supercharge/collections'
import { Application, ErrorHandler as ErrorHandlerContract, HttpContext, Logger, ViewEngine } from '@supercharge/contracts'

export class ErrorHandler implements ErrorHandlerContract {
  /**
   * The application instance.
   */
  protected readonly app: Application

  /**
   * The list of error types to not report.
   */
  protected readonly ignoredErrors: ErrorConstructor[]

  /**
   * Stores the list of report callbacks.
   */
  protected readonly reportCallbacks: Array<(ctx: HttpContext, error: HttpError) => void | Promise<void>>

  /**
   * Create a new error handler instance.
   */
  constructor (app: Application) {
    this.app = app
    this.ignoredErrors = []
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
    //
  }

  /**
   * Tell the error handler to not report the `error` type.
   */
  ignore (error: ErrorConstructor): this {
    return tap(this, () => {
      this.ignoredErrors.push(error)
    })
  }

  /**
   * Returns an array of errors that should not be reported.
   */
  dontReport (): ErrorConstructor[] {
    return ([] as ErrorConstructor[])
  }

  /**
   * Determine whether to report the given `error`.
   */
  shouldntReport (error: any): boolean {
    return this.dontReport().concat(this.ignoredErrors).some(ErrorConstructor => {
      return error instanceof ErrorConstructor
    })
  }

  /**
   * Register a reportable callback.
   *
   * @param  {Function} reportUsing
   *
   * @returns {ErrorHandler}
   */
  reportable (reportUsing: (ctx: HttpContext, error: any) => void | Promise<void>): ErrorHandler {
    return tap(this, () => {
      this.reportCallbacks.push(reportUsing)
    })
  }

  /**
   * Returns the error’s context for logging.
   *
   * @param {*}error
   *
   * @returns {Record<string, any>}
   */
  errorContext (error: any): Record<string, any> {
    if (typeof error.context === 'function') {
      return { ...error.context() }
    }

    return {}
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
  async handle (ctx: HttpContext, error: any): Promise<void> {
    await this.report(ctx, error)
    await this.render(ctx, error)
  }

  /**
   * Report an error.
   *
   * @param {HttpContext} ctx
   * @param {HttpError} error
   */
  async report (ctx: HttpContext, error: any): Promise<void> {
    if (this.shouldntReport(error)) {
      return
    }

    if (await this.errorReported(ctx, error)) {
      return
    }

    const handled = await Collect(this.reportCallbacks).any(async reportCallback => {
      return await reportCallback(ctx, error)
    })

    if (handled) {
      return
    }

    const context = {
      ...this.context(ctx),
      ...this.errorContext(error),
      error,
    }

    this.logger().error(error.message, context)
  }

  /**
   * Determine whether the given `error` is implementing a `handle` method and
   * that `handle` method returns a truthy value, like a valid HTTP response.
   *
   * @param {HttpContext} ctx
   * @param {Error} error
   *
   * @returns {*}
   */
  async errorReported (ctx: HttpContext, error: any): Promise<unknown> {
    if (typeof error.report !== 'function') {
      return false
    }

    return await error.report(error, ctx)
  }

  /**
   * Render the error into an HTTP response.
   *
   * @param {HttpContext} ctx
   * @param {HttpError} error
   */
  async render (ctx: HttpContext, error: any): Promise<any> {
    if (await this.errorRendered(ctx, error)) {
      return
    }

    const httpError = HttpError.wrap(error)

    if (ctx.request.wantsJson()) {
      return this.renderJsonResponse(ctx, httpError)
    }

    if (this.app.env().isProduction()) {
      return this.renderJsonResponse(ctx, httpError)
    }

    return await this.renderViewResponse(ctx, httpError)
  }

  /**
   * Determine whether the given `error` is implementing a `render` method and
   * that `render` method returns a truthy value, like a valid HTTP response.
   *
   * @param {HttpContext} ctx
   * @param {Error} error
   *
   * @returns {*}
   */
  async errorRendered (ctx: HttpContext, error: any): Promise<unknown> {
    if (typeof error.render !== 'function') {
      return false
    }

    return await error.render(ctx, error)
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

    // @ts-expect-error
    if (typeof ctx.response.view === 'function') {
      // @ts-expect-error
      return await ctx.response.status(error.status).view(
        this.viewTemplateFor(error), { error }
      )
    }

    ctx.response.status(error.status).payload(`<h1>${error.message}</h1>`)
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
      await new Youch(error, request.req()).toHTML({})
    ).status(error.status)
  }
}
