
import Youch from 'youch'
import { SetOptional } from 'type-fest'
import { tap } from '@supercharge/goodies'
import { HttpError } from './http-error.js'
import { Collect } from '@supercharge/collections'
import { Application, ErrorHandler as ErrorHandlerContract, HttpContext, Logger, RenderableError, ReportableError, ViewEngine } from '@supercharge/contracts'

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
  protected readonly reportCallbacks: Array<(error: any, ctx: HttpContext) => Promise<void> | void>

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
    return []
  }

  /**
   * Determine whether to report the given `error`.
   */
  shouldNotReport (error: Error): boolean {
    return this
      .dontReport()
      .concat(this.ignoredErrors)
      .some(ErrorConstructor => {
        return error instanceof ErrorConstructor
      })
  }

  /**
   * Register a reportable callback.
   */
  reportable (reportUsing: (error: any, ctx: HttpContext) => void | Promise<void>): ErrorHandler {
    return tap(this, () => {
      this.reportCallbacks.push(reportUsing)
    })
  }

  /**
   * Returns the error’s context for logging.
   */
  errorContext (error: any): Record<string, any> {
    if (typeof error.context === 'function') {
      return { ...error.context() }
    }

    return {}
  }

  /**
   * Returns the default logging context.
   */
  context (_ctx: HttpContext): any {
    return {}
  }

  /**
   * Handle the given error.
   */
  async handle (error: Error, ctx: HttpContext): Promise<void> {
    await this.report(error, ctx)
    await this.render(error, ctx)
  }

  /**
   * Report an error.
   */
  async report (error: Error, ctx: HttpContext): Promise<void> {
    if (this.shouldNotReport(error)) {
      return
    }

    if (await this.errorReported(error, ctx)) {
      return
    }

    const handled = await Collect(this.reportCallbacks).any(async reportCallback => {
      return await reportCallback(error, ctx)
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
   * Determine whether the given `error` is implementing a `report` method and
   * that `report` method returns a truthy value, like a valid HTTP response.
   */
  async errorReported (error: SetOptional<ReportableError, 'report'>, ctx: HttpContext): Promise<unknown> {
    if (typeof error.report !== 'function') {
      return false
    }

    return !!(await error.report(error, ctx))
  }

  /**
   * Render the error into an HTTP response.
   */
  async render (error: Error, ctx: HttpContext): Promise<any> {
    if (await this.errorRendered(error, ctx)) {
      return
    }

    const httpError = HttpError.wrap(error)

    if (ctx.request.wantsJson()) {
      return this.renderJsonResponse(httpError, ctx)
    }

    if (this.app.env().isProduction()) {
      return this.renderJsonResponse(httpError, ctx)
    }

    return await this.renderViewResponse(httpError, ctx)
  }

  /**
   * Determine whether the given `error` is implementing a `render` method and
   * that `render` method returns a truthy value, like a valid HTTP response.
   */
  async errorRendered (error: SetOptional<RenderableError, 'render'>, ctx: HttpContext): Promise<unknown> {
    if (typeof error.render !== 'function') {
      return false
    }

    return await error.render(error, ctx)
  }

  /**
   * Creates a JSON response depending on the app’s environment.
   */
  protected renderJsonResponse (error: HttpError, ctx: HttpContext): void {
    const { message, stack, status: statusCode } = error

    this.app.env().isProduction()
      ? ctx.response.status(statusCode).payload({ message, statusCode })
      : ctx.response.status(statusCode).payload({ message, statusCode, stack })
  }

  /**
   * Creates an HTML response depending on the app’s environment.
   */
  protected async renderViewResponse (error: HttpError, ctx: HttpContext): Promise<void> {
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
   */
  protected async isMissingTemplateFor (error: HttpError): Promise<boolean> {
    return !await this.templateExistsFor(error)
  }

  /**
   * Determine whether a view template file exists for the given `error`.
   */
  protected async templateExistsFor (error: HttpError): Promise<boolean> {
    return await this.view().exists(
      this.viewTemplateFor(error)
    )
  }

  /**
   * Returns the view template file for the given `error`.
   */
  protected viewTemplateFor (error: HttpError): string {
    return `errors/${error.status}`
  }

  /**
   * Renders an HTML response containing details about the given `error`.
   */
  async renderYouchResponse ({ request, response }: HttpContext, error: HttpError): Promise<void> {
    response.payload(
      await new Youch(error, request.req()).toHTML({})
    ).status(error.status)
  }
}
