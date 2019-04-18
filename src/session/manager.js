'use strict'

const Config = require('../config')

class SessionManager {
  constructor (server) {
    this.server = server
    this.cookieOptions = Config.get('session')
  }

  async boot () {
    // start session driver?

    this.prepareSessionCookie()
    // prepare request.session decoration
    // register session middleware?
  }

  prepareSessionCookie () {
    const { name, options } = this.cookieOptions
    this.server.state(name, options)
  }
}

module.exports = SessionManager
