'use strict'

const Path = require('path')
const Database = require('../index')
const Helper = require('../../helper')
const Config = require('../../config')
const Fs = require('../../filesystem')
const Collect = require('@supercharge/collections')

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
    await this.connectToDatabase()
  }

  /**
   * Properly close the database connection
   * after server stop.
   */
  async onPostStop () {
    await this.disconnectFromDatabase()
  }

  /**
   * Connect to the database if necessary.
   * If no models are existent, no
   * connection is needed.
   */
  async connectToDatabase () {
    if (await this.shouldConnect()) {
      await Database.connect()
    }
  }

  /**
   * Close the database connection
   */
  async disconnectFromDatabase () {
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
    return Collect(
      await this.modelFiles()
    ).isNotEmpty()
  }

  /**
   * Returns the model files.
   *
   * @returns {Array}
   */
  async modelFiles () {
    if (!this._modelFiles) {
      this._modelFiles = await this.loadModelFiles()
    }

    return this._modelFiles
  }

  /**
   * Load the application’s model files from disk.
   *
   * @returns {Array}
   */
  async loadModelFiles () {
    if (await Fs.exists(Helper.modelsPath())) {
      return Collect(await this.retrieveFilesFromDisk())
        .map(file => {
          this.registerModelToMongoose(file)

          return file
        })
        .all()
    }

    return []
  }

  /**
   * Read all models files recursively from the hard disk.
   *
   * @returns {Array}
   */
  async retrieveFilesFromDisk () {
    return Fs.allFiles(Helper.modelsPath(), {
      ignore: this.shouldIgnore
    })
  }

  /**
   * Resolve the model file which registers the model to Mongoose.
   *
   * @param {String} modelFile
   */
  registerModelToMongoose (modelFile) {
    require(modelFile)
  }

  /**
   * Determine whether the file’s name starts with a `.`.
   *
   * @param {String} file
   *
   * @returns {Boolean}
   */
  shouldIgnore (file) {
    return Path.basename(file).startsWith('.')
  }
}

module.exports = DatabaseConnectionLifecycle
