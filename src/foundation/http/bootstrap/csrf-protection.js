'use strict'

const Config = require('../../../config')

class CsrfProtection {
  constructor (app) {
    this.app = app
  }

  async extends (server) {
    if (!this.app.isRunningTests()) {
      await this.protect(server)
    }
  }

  /**
   * Configure CSRF protection based on the `crumb` hapi plugin.
   * Register `crumb` as the last plugin in the server to
   * make sure the CSRF token is added to every view.
   *
   * @param {Object} server
   */
  async protect (server) {
    await server.register({
      plugin: require('crumb'),
      options: {
        key: Config.get('session.token'),
        logUnauthorized: true,
        cookieOptions: {
          password: Config.get('app.key'),
          isSecure: Config.get('app.isProduction')
        }
      }
    })
  }
}

module.exports = CsrfProtection
