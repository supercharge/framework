'use strict'

const Path = require('path')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')

class ExtendAppFromUserland {
  constructor () {
    this._appFile = 'bootstrap/app.js'
  }

  async extends (server) {
    const extendApp = await this.resolveAppFile()

    if (extendApp) {
      await extendApp(server)
    }
  }

  async resolveAppFile () {
    if (await Fs.exists(this.appFile())) {
      return require(this.appFile())
    }
  }

  appFile () {
    return Path.resolve(Helper.appRoot(), this._appFile)
  }
}

module.exports = ExtendAppFromUserland
