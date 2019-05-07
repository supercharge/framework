'use strict'

const Helper = require('../../helper')
const Config = require('../../config')
const Database = require('../index')
const ReadRecursive = require('recursive-readdir')

class DatabaseConnectionLifecycle {
  constructor () {
    this._modelFiles = null
    this._config = Config.get('database', {})
  }

  /**
   * Establish the database before starting
   * the HTTP server.
   */
  async onPreStart () {
    await this.connectDatabase()
  }

  /**
   * Properly close the database connection
   * after server stop.
   */
  async onPostStop () {
    await this.disconnectDatabase()
  }

  /**
   * Connect to the database if necessary.
   * If no models are existent, no
   * connection is needed.
   */
  async connectDatabase () {
    if (await this.shouldConnect()) {
      await Database.connect()
    }
  }

  /**
   * Close the database connection
   */
  async disconnectDatabase () {
    await Database.close()
  }

  /**
   * Determines whether to connect the database.
   *
   * @returns {Boolean}
   */
  async shouldConnect () {
    if (!this.defaultDriver()) {
      return false
    }

    if (!await this.hasModels()) {
      return false
    }

    return true
  }

  /**
   * Returns the default database driver
   * from the app configuration.
   */
  defaultDriver () {
    return this._config.default
  }

  /**
   * Determines whether models exist in the app.
   *
   * @returns {Boolean}
   */
  async hasModels () {
    return Object.keys(await this.modelFiles()).length > 0
  }

  /**
   * Load the model files.
   *
   * @returns {Array}
   */
  async modelFiles () {
    if (!this._modelFiles) {
      this._modelFiles = await ReadRecursive(Helper.modelsPath())
    }

    return this._modelFiles
  }
}

module.exports = DatabaseConnectionLifecycle
