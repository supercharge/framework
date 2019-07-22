'use strict'

const Path = require('path')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')

class LoadUserlandBootstrapper {
  constructor () {
    this.bootstrapFile = 'bootstrap/app.js'
  }

  async _loadUserlandBootstrappers () {
    if (await Fs.exists(this._bootstrapFile())) {
      const { boostrappers = [] } = require(this._bootstrapFile())

      return boostrappers
    }

    return []
  }

  _bootstrapFile () {
    return Path.resolve(Helper.appRoot(), this.bootstrapFile)
  }
}

module.exports = LoadUserlandBootstrapper
