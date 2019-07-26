'use strict'

const Boom = require('@hapi/boom')
const Session = require('../../session')

class SessionAuthenticationScheme {
  constructor (server, strategy) {
    this.server = server
    this.strategy = strategy

    this.config = Session.config()
    const { name } = this.config.cookie
    this.cookieName = name
  }

  static get name () {
    return 'session'
  }

  async authenticate (request, h) {
    try {
      const { credentials, artifacts } = await this.strategy.validate(request)

      return h.authenticated({ credentials, artifacts })
    } catch (error) {
      return h.unauthenticated(
        Boom.unauthorized(null, SessionAuthenticationScheme.name)
      )
    }
  }
}

module.exports = SessionAuthenticationScheme
