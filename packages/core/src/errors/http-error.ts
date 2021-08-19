'use strict'

import { HttpError as BaseHttpError } from '@supercharge/errors'

export class HttpError extends BaseHttpError {
  /**
   * Create a new HTTP error instance.
   *
   * @param {String} message
   */
  constructor (message: string) {
    super(message, 500)
  }

  /**
   * Returns a new HTTP error instance wrapping the given `error`.
   *
   * @param {Error} error
   *
   * @returns {HttpError}
   */
  static wrap (error: Error): HttpError {
    return new HttpError(error.message).withStatus(
      this.retrieveStatusFrom(error)
    )
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
