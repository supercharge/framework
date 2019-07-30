'use strict'

const Boom = require('@hapi/boom')
const Logger = require('../../logging')

class VerifyCsrfToken {
  constructor (server) {
    this.server = server
  }

  /**
   * Request lifecycle extension point to verify
   * the CSRF token.
   *
   * @param {Request} request
   * @param {Toolkit} h
   */
  async onPostAuth (request, h) {
    if (await this.canProceed(request)) {
      this.rotateToken(request)

      return h.continue
    }

    console.log('cannot proceed!')

    return this.forbidden()
  }

  /**
   * Append the CSRF token to the response.
   *
   * @param {Request} request
   * @param {Toolkit} h
   */
  onPreResponse (request, h) {
    this.addCookieToResponse(request, h)
    this.addTokenToViewContext(request, h)

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
  async canProceed (request) {
    return this.isReading(request) || this.isTesting() || this.tokensMatch(request)
  }

  /**
   * Determines whether the request is requesting data
   * and not sending input in the request payload.
   *
   * @param {Request} request
   *
   * @returns {Boolean}
   */
  isReading (request) {
    return ['GET', 'HEAD', 'OPTIONS'].includes(request.method.toLocaleUpperCase())
  }

  /**
   * Determines whether the current environment is testing.
   *
   * @returns {Boolean}
   */
  isTesting () {
    return this.server.app.isRunningTests()
  }

  /**
   * Compare the CSRF tokens coming with the request
   * against the stored token in the session.
   *
   * @param {Request} request
   *
   * @returns {Boolean}
   */
  async tokensMatch (request) {
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
  getTokenFrom (request) {
    return request.input('_csrfToken') || request.header('x-csrf-token')
  }

  /**
   * Regenerate the CSRF token.
   *
   * @param {Request} request
   */
  rotateToken (request) {
    request.session.rotateToken()
  }

  /**
   * Append the `XSRF-Token` to the response
   * using an encrypted cookie.
   *
   * @param {Request} request
   * @param {Toolkit} h
   */
  addCookieToResponse (request, h) {
    return h.cookie('XSRF-TOKEN', request.session.token())
  }

  /**
   * Append the CSRF token to the response
   * when rendering a view.
   *
   * @param {Request} request
   */
  addTokenToViewContext (request) {
    const response = request.response

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
  isBoomError (response) {
    return response.isBoom
  }

  /**
   * Determine whether the response wants to render a view.
   *
   * @param {Object} response
   *
   * @returns {Boolean}
   */
  isView (response) {
    return response.variety === 'view'
  }

  /**
   * Logs a debug message and throws an HTTP forbidden error.
   */
  forbidden () {
    Logger.debug('CSRF token verification failed')
    throw Boom.forbidden()
  }
}

module.exports = VerifyCsrfToken
