'use strict'

const DatabaseConnectionLifecycle = require('./middleware/connection-lifecycle')

class DatabaseBoostrapper {
  constructor (server) {
    this._server = server
    this._modelFiles = null
  }

  /**
   * Bootstrap the database by registering a middleware
   * that properly connects and disconnects the
   * database when starting and stopping the server.
   */
  async boot () {
    await this._server.registerMiddleware(DatabaseConnectionLifecycle)
  }
}

module.exports = DatabaseBoostrapper
