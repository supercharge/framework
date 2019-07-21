'use strict'

const SessionManager = require('../manager')

class StartSessionDriver {
  constructor () {
    this.manager = SessionManager
  }

  /**
   * Start the session driver while booting the HTTP server.
   */
  async onPreStart () {
    await this.manager._startDriver()
  }

  /**
   * Stop the session driver when shutting down the HTTP server.
   */
  async onPostStop () {
    await this.manager._stopDriver()
  }
}

module.exports = StartSessionDriver
