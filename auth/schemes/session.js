'use strict'

const Boom = require('@hapi/boom')

class SessionScheme {
  constructor (_, strategy) {
    this.strategy = strategy
  }

  static get name () {
    return 'session'
  }

  async authenticate (request, h) {
    const { credentials, artifacts } = await this.strategy.validate(request, h)

    if (credentials) {
      return h.authenticated({ credentials, artifacts })
    }

    return h.unauthenticated(Boom.unauthorized(null, SessionScheme.name))
  }
}

module.exports = SessionScheme
