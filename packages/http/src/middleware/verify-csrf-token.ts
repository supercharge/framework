'use strict'

import Boom from '@hapi/boom'
import { Env } from '@supercharge/env'
import { parse, match } from 'matchit'
import { Logger } from '@supercharge/logging'
import { Request, ResponseToolkit } from '@hapi/hapi'

export class VerifyCsrfToken {
  /**
   * Returns an array of URIs that should be excluded from CSRF verfication.
   *
   * @returns {Array}
   */
  exclude (): string[] {
    return []
  }

  /**
   * Request lifecycle extension point to verify
   * the CSRF token.
   *
   * @param {Request} request
   * @param {Toolkit} h
   */
  async onPostAuth (request: Request, h: ResponseToolkit): Promise<any> {
    if (this.shouldSkip(request)) {
      return h.continue
    }

    if (await this.tokensMatch(request)) {
      this.rotateToken(request)

      return h.continue
    }

    return this.forbidden()
  }

  /**
   * Append the CSRF token to the response.
   *
   * @param {Request} request
   * @param {Toolkit} h
   */
  onPreResponse (request: Request, h: ResponseToolkit): symbol {
    if (this.hasNoSession(request)) {
      return h.continue
    }

    this.addCookieToResponse(request, h)
    this.addTokenToViewContext(request)

    return h.continue
  }

  /**
   * Determines whether the request matches all conditions
   * to proceed the request lifecycle.
   *
   * @param {Request} request
   *
   * @returns {Boolean}
   */
  shouldSkip (request: Request): boolean {
    return this.isReading(request) || this.isTesting() || this.hasNoSession(request) || this.isExcluded(request)
  }

  /**
   * Determines whether the request is requesting data
   * and not sending input in the request payload.
   *
   * @param {Request} request
   *
   * @returns {Boolean}
   */
  isReading (request: Request): boolean {
    return ['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())
  }

  /**
   * Determines whether the current environment is testing.
   *
   * @returns {Boolean}
   */
  isTesting (): boolean {
    return Env.isTesting()
  }

  /**
   * Determines whether the request contains a session.
   * This can be the case for APIs where a session
   * won’t be attached to a request.
   *
   * @returns {Boolean}
   */
  hasNoSession (request: any): boolean {
    return !request.session
  }

  /**
   * Determines whether the requested URI should be
   * excluded from CSRF verification.
   *
   * @param {Request} request
   *
   * @returns {Boolean}
   */
  isExcluded (request: Request): boolean {
    const excludes = ([] as string[]).concat(this.exclude()).map(parse)
    const matches = match(request.path, excludes)

    return matches.length > 0
  }

  /**
   * Compare the CSRF tokens coming with the request
   * against the stored token in the session.
   *
   * @param {Request} request
   *
   * @returns {Boolean}
   */
  tokensMatch (request: any): boolean {
    const token = this.getTokenFrom(request)

    return token === request.session.token()
  }

  /**
   * Retrieve the incoming CSRF token from the request.
   *
   * @param {Request} request
   *
   * @returns {String}
   */
  getTokenFrom (request: any): string | undefined {
    return request.input('_csrfToken') || request.header('x-csrf-token')
  }

  /**
   * Regenerate the CSRF token.
   *
   * @param {Request} request
   */
  rotateToken (request: any): void {
    request.session.rotateToken()
  }

  /**
   * Append the `XSRF-Token` to the response
   * using an encrypted cookie.
   *
   * @param {Request} request
   * @param {Toolkit} h
   */
  addCookieToResponse (request: any, h: any): void {
    return h.cookie('XSRF-TOKEN', request.session.token())
  }

  /**
   * Append the CSRF token to the response
   * when rendering a view.
   *
   * @param {Request} request
   */
  addTokenToViewContext (request: any): void {
    const response: any = request.response

    if (this.isBoomError(response)) {
      return
    }

    if (this.isView(response)) {
      response.source.context = response.source.context || {}
      response.source.context._csrfToken = request.session.token()
    }
  }

  /**
   * Determine whether it’s and error response.
   *
   * @param {Object} response
   *
   * @returns {Boolean}
   */
  isBoomError (response: any): boolean {
    return response.isBoom
  }

  /**
   * Determine whether the response wants to render a view.
   *
   * @param {Object} response
   *
   * @returns {Boolean}
   */
  isView (response: any): boolean {
    return response.variety === 'view'
  }

  /**
   * Logs a debug message and throws an HTTP forbidden error.
   */
  forbidden (): void {
    Logger.debug('CSRF token verification failed')

    throw Boom.forbidden('CSRF token verification failed')
  }
}

module.exports = VerifyCsrfToken
