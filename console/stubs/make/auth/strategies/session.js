'use strict'

const User = require('../../models/user')
const Config = require('@supercharge/framework/config')

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
