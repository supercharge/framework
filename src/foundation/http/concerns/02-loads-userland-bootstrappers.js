'use strict'

const Path = require('path')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')
const Logger = require('../../../logging')
const RegistersAppPlugins = require('./03-registers-app-plugins')

class LoadUserlandBootstrapper extends RegistersAppPlugins {
  constructor () {
    super()

    this.bootstrapperFile = 'bootstrap/app.js'
  }

  async _loadUserlandBootstrappers () {
    if (await this._hasBootstrapFile()) {
      return this._loadBootstrappers()
    }

    Logger.debug('Missing bootstrap/app.js file. Skipping bootstrappers while app start.')

    return []
  }

  async _hasBootstrapFile () {
    return Fs.exists(this._bootstrapFile())
  }

  _bootstrapFile () {
    return Path.resolve(Helper.appRoot(), this.bootstrapperFile)
  }

  async _loadBootstrappers () {
    const { bootstrappers } = require(this._bootstrapFile())

    if (!Array.isArray(bootstrappers)) {
      Logger.error(`The "bootstrappers" property in bootstrap/app.js must be an array, received ${typeof bootstrappers}. Ignoring the file.`)

      return []
    }

    return bootstrappers
  }
}

module.exports = LoadUserlandBootstrapper
