
import { HttpContext } from '@supercharge/contracts/src'
import { HttpError as BaseHttpError } from '@supercharge/errors'

export class HttpError extends BaseHttpError {
  /**
   * Create a new HTTP error instance.
   *
   * @param {String} message
   */
  constructor (message: string) {
    super(message)

    this.withStatus(500)
  }

  /**
   * Returns a new HTTP error instance wrapping the given `error`.
   *
   * @param {Error} error
   *
   * @returns {HttpError}
   */
  static wrap (error: Error): HttpError {
    const err = new this(error.message).withStatus(
      this.retrieveStatusFrom(error)
    )

    if (error.stack) {
      err.withStack(error.stack)
    }

    return err
  }

  /**
   * Retrieves an available status code from the error instance.
   * Falls back to HTTP status 500 if no status code is found.
   *
   * @param {Error} error
   *
   * @returns {Number}
   */
  private static retrieveStatusFrom (error: any): number {
    return error.status || error.statusCode || 500
  }

  /**
   * Report the given `error` on the related HTTP `ctx`. Return a `falsy`
   * value if you don’t want the Supercharge error handler to run the
   * registered reporters and logging for the given error instance.
   */
  report (_error: any, _ctx: HttpContext): Promise<any> | any {
    //
  }

  /**
   * Render the given `error` on the related HTTP `ctx`. Return a `falsy`
   * value if you don’t want the Supercharge error handler to render
   *  the error instance into an HTTP response, like view or JSON.
   */
  render (_error: any, _ctx: HttpContext): Promise<any> | any {
    //
  }
}
