'use strict'

const Helper = require('../../helper')
const Config = require('../../config')
const Database = require('../index')
const ReadRecursive = require('recursive-readdir')

class DatabaseConnectionLifecycle {
  constructor () {
    this._modelFiles = null
    this._config = Config.get('database')
  }

  async onPreStart () {
    await this.connectDatabase()
  }

  async onPostStop () {
    await this.disconnectDatabase()
  }

  async connectDatabase () {
    if (await this.shouldConnect()) {
      await Database.connect()
    }
  }

  async disconnectDatabase () {
    await Database.close()
  }

  async shouldConnect () {
    if (!this.defaultDriver()) {
      return false
    }

    if (!await this.hasModels()) {
      return false
    }

    return true
  }

  defaultDriver () {
    return this._config.default
  }

  async hasModels () {
    return Object.keys(await this.modelFiles()).length > 0
  }

  async modelFiles () {
    if (!this._modelFiles) {
      this._modelFiles = await ReadRecursive(Helper.modelsPath())
    }

    return this._modelFiles
  }
}

module.exports = DatabaseConnectionLifecycle
