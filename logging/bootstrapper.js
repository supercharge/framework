'use strict'

const LoggingManager = require('./')

class LoggingBootstrapper {
  constructor () {
    this.manager = LoggingManager
  }

  async boot () {
    await this.manager.ensureLogger()
  }
}

module.exports = LoggingBootstrapper
