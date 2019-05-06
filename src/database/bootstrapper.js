'use strict'

const Database = require('.')
const Config = require('../config')
const Helper = require('../helper')
const ReadRecursive = require('recursive-readdir')

class DatabaseBoostrapper {
  constructor (app) {
    this.app = app
    this._modelFiles = null
    this.config = Config.get('database')
  }

  async boot () {
    await this.connectDatabase()
  }

  async connectDatabase () {
    if (await this.shouldConnect()) {
      await Database.connect()
    }
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
    return this.config.default
  }

  async hasModels () {
    return Object.keys(await this.modelFiles()).length > 0
  }

  async modelFiles () {
    if (!this._modelFiles) {
      this._modelFiles = await ReadRecursive(Helper.modelsPath())
    }

    return this._strategyFiles
  }
}

module.exports = DatabaseBoostrapper
