'use strict'

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
}
