
import { HttpContext, Application } from '../index.js'

export type ErrorHandlerCtor =
  /**
   * Create a new error handler instance.
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
  handle(error: Error, ctx: HttpContext): Promise<void>

  /**
   * Report an error.
   */
  report(error: Error, ctx: HttpContext): void | Promise<void>

  /**
   * Render an error into an HTTP response.
   */
  render(error: Error, ctx: HttpContext): Promise<any>
}
