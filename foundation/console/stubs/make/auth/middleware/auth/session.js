'use strict'

const User = require('../../../models/user')
const Config = require('@supercharge/framework/config')

/**
 * Tba.
 */
async function register (server) {
  /**
   * Tba.
   */
  server.auth.strategy('session', 'cookie', {
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
      const userId = session.id

      if (!userId) {
        return { credentials: null, valid: false }
      }

      const user = await User.findById(userId)

      if (!user) {
        return { credentials: null, valid: false }
      }

      return { credentials: user, valid: true }
    }
  })
}

exports.plugin = {
  name: 'session-authentication',
  once: true,
  register
}
