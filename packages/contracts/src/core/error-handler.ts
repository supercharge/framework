
import { HttpContext, Application } from '..'

export type ErrorHandlerCtor =
  /**
   * Create a new error handler instance.
   *
   * @param {Application} app - the application instance
   */
  new(app: Application) => ErrorHandler

export interface ErrorHandler {
  /**
   * Tell the error handler to not report the `error` type.
   */
  ignore(error: ErrorConstructor): this

  /**
   * Handle the given error.
   */
  handle(ctx: HttpContext, error: Error): Promise<void>

  /**
   * Report an error.
   */
  report(context: HttpContext, error: Error): void | Promise<void>

  /**
   * Render an error into an HTTP response.
   */
  render(context: HttpContext, error: Error): Promise<any>
}
