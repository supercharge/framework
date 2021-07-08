'use strict'

import { tap } from '@supercharge/goodies'

export class HttpError extends Error {
  /**
   * The HTTP status code for this error.
   */
  public statusCode: number

  /**
   * Create a new HTTP error instance.
   *
   * @param {String} message
   */
  constructor (message: string) {
    super(message)
    Error.captureStackTrace(this, this.constructor)

    this.statusCode = 500
  }

  /**
   * Returns a new HTTP error instance wrapping the given `error`.
   *
   * @param {*} error
   *
   * @returns {HttpError}
   */
  static wrap (error: any): HttpError {
    return new HttpError(error.message).withStatus(
      this.retrieveStatusFrom(error)
    )
  }

  /**
   * Retrieves an available status code from the error instance.
   * Falls back to HTTP status 500 if no status code is found.
   *
   * @param error
   *
   * @returns {Number}
   */
  private static retrieveStatusFrom (error: any): number {
    return error.status || error.statusCode || 500
  }

  /**
   * Assign the given HTTP `status` code to this error.
   *
   * @param status
   *
   * @returns {HttpError}
   */
  withStatus (status: number): HttpError {
    return tap(this, () => {
      this.statusCode = status
    })
  }
}
