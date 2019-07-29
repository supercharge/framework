'use strict'

const Boom = require('@hapi/boom')
const Logger = require('../../logging')

class VerifyCsrfToken {
  async onPostAuth (request, h) {
    if (await this.canProceedLifecycle(request)) {
      request.session.regenerateToken()

      return h.continue
    }

    return this.forbidden()
  }

  onPreResponse (request, h) {
    this.addCookieToResponse(request, h)
    this.addTokenToViewContext(request, h)

    return h.continue
  }

  async canProceedLifecycle (request) {
    return this.isReading(request) && this.tokensMatch(request)
  }

  isReading (request) {
    return ['GET', 'HEAD', 'OPTIONS'].includes(request.method)
  }

  async tokensMatch (request) {
    const token = this.getTokenFrom(request)

    return token === request.session.token()
  }

  getTokenFrom (request) {
    return request.input('_csrfToken') || request.header('x-csrf-token')
  }

  forbidden () {
    Logger.debug('CSRF token verification failed')
    throw Boom.forbidden()
  }

  addCookieToResponse (request, h) {
    return h.cookie('XSRF-Token', request.session.token())
  }

  addTokenToViewContext (request) {
    const response = request.response

    if (response.variety === 'view') {
      response.source.context = response.source.context || {}
      response.source.context['_csrfToken'] = request.session.token()
    }
  }
}

module.exports = VerifyCsrfToken
