'use strict'

const LoggingManager = require('./')

class SessionBootstrapper {
  constructor () {
    this.manager = LoggingManager
  }

  async boot () {
    await this.manager.ensureLogger()
  }
}

module.exports = SessionBootstrapper
