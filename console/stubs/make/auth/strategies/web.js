'use strict'

const User = require('../../models/user')
const Config = require('@supercharge/framework/config')

class WebAuthentication {
  static get name () {
    return 'web'
  }

  static get scheme () {
    'session'
  }

  async validate (request) {
    const { session } = request

    if (!session.userId) {
      return { valid: false, credentials: null }
    }

    const user = await User.findById(session.userId)

    if (!user) {
      return { valid: false, credentials: null }
    }

    return { valid: true, credentials: user }
  }
}

module.exports = WebAuthentication

/**
 * Tba.
 */
module.exports = {
  name: 'session',
  scheme: 'cookie',
  options: {
    /**
     * Tba.
     */
    requestDecoratorName: 'session',
    password: Config.get('app.key'),
    cookie: Config.get('session.cookie'),
    isSecure: Config.get('app.isProduction'),
    ttl: Config.get('session.lifetime'),
    redirectTo: '/login',
    appendNext: true,

    /**
     * Tba.
     */
    validateFunc: async (request, session) => {
      if (!session.userId) {
        return { valid: false, credentials: null }
      }

      const user = await User.findById(session.userId)

      if (!user) {
        return { valid: false, credentials: null }
      }

      return { valid: true, credentials: user }
    }
  }
}
