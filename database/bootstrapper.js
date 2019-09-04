'use strict'

const DatabaseConnectionLifecycle = require('./middleware/connection-lifecycle')

class DatabaseBoostrapper {
  constructor ({ server }) {
    this.server = server
  }

  /**
   * Bootstrap the database by registering a middleware
   * that properly connects and disconnects the
   * database when starting and stopping the server.
   */
  async boot () {
    await this.server.extClass(DatabaseConnectionLifecycle)
  }
}

module.exports = DatabaseBoostrapper
