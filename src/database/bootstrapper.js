'use strict'

const DatabaseConnectionLifecycle = require('./middleware/connection-lifecycle')

class DatabaseBoostrapper {
  constructor (app) {
    this._app = app
    this._modelFiles = null
  }

  async boot () {
    await this._app.registerMiddleware(DatabaseConnectionLifecycle)
  }
}

module.exports = DatabaseBoostrapper
