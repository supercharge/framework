'use strict'

const _ = require('lodash')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')
const Config = require('../../../config')
const Database = require('../../../database')

class ConnectDatabase {
  async extends () {
    if (await this.shouldConnect()) {
      await Database.connect()
    }
  }

  async shouldConnect () {
    if (!Config.get('database.default')) {
      return false
    }

    return this.hasModels()
  }

  async hasModels () {
    if (await Fs.exists(Helper.modelsPath())) {
      const models = await Fs.readDir(Helper.modelsPath())

      return !_.isEmpty(models)
    }

    return false
  }
}

module.exports = ConnectDatabase
