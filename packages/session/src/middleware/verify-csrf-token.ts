'use strict'

import { parse, match } from 'matchit'
import { HttpError } from '@supercharge/http-errors'
import { Application, HttpContext, HttpRequest, HttpResponse, Middleware, NextHandler } from '@supercharge/contracts'

export class VerifyCsrfTokenMiddleware implements Middleware {
  /**
   * Stores the application instance.
   */
  protected readonly app: Application

  /**
   * Create a new middleware instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.app = app
  }

  /**
   * Returns an array of URIs that should be excluded from CSRF verfication.
   *
   * @returns {Array}
   */
  exclude (): string[] {
    return []
  }

  /**
   * Handle the incoming request.
   *
   * @param ctx HttpContext
   * @param next NextHandler
   */
  async handle ({ request, response }: HttpContext, next: NextHandler): Promise<any> {
    if (this.shouldValidate(request)) {
      this.validateCsrfToken(request)
    }

    this
      .rotateToken(request)
      .addCookieToResponse(request, response)

    await next()
  }

  /**
   * Determine whether to skip checking the CSRF token on the given `request`.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  shouldValidate (request: HttpRequest): boolean {
    return !request.isMethod(['GET', 'HEAD', 'OPTIONS']) && this.urlIsNotExcluded(request)
  }

  /**
   * Determine whether the `request`’s URI is not excluded from CSRF verification.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  urlIsNotExcluded (request: HttpRequest): boolean {
    const excludes = ([] as string[])
      .concat(this.exclude())
      .map(path => parse(path))

    const matches = match(request.path(), excludes)

    return matches.length === 0
  }

  /**
   * Validate the CSRF tokens and throw an exception in case they don’t match.
   *
   * @param {HttpRequest} request
   */
  validateCsrfToken (request: HttpRequest): void {
    const token = this.getCsrfTokenFrom(request)

    if (token !== request.session().token()) {
      throw HttpError.forbidden('CSRF token mismatch')
    }
  }

  /**
   * Retrieve the incoming CSRF token from the request.
   *
   * @param {Request} request
   *
   * @returns {String}
   */
  getCsrfTokenFrom (request: HttpRequest): string | undefined {
    return request.input('_csrfToken') || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
            request.input('_csrf') || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
            request.header('xsrf-token', '') as string ||
            request.header('x-csrf-token', '') as string ||
            request.header('x-xsrf-token', '') as string
  }

  /**
   * Regenerate the CSRF token.
   *
   * @param {HttpRequest} request
   */
  rotateToken (request: HttpRequest): this {
    request.session().regenerateToken()

    return this
  }

  /**
   * Append the `XSRF-Token` to the response using an encrypted cookie.
   *
   * @param {HttpContext} ctx
   */
  addCookieToResponse (request: HttpRequest, response: HttpResponse): void {
    response.cookie('XSRF-TOKEN', request.session().token())
  }
}
