'use strict'

const Path = require('path')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')

class ExtendAppFromUserland {
  constructor () {
    this._appFile = 'bootstrap/app.js'
  }

  async extends (server) {
    const extendApp = await this.loadExtendApp()

    if (extendApp) {
      await extendApp(server)
    }
  }

  async loadExtendApp () {
    if (await Fs.exists(this.appFile())) {
      require(this.appFile())
    }
  }

  appFile () {
    return Path.resolve(Helper.appRoot(), this._appFile)
  }
}

module.exports = ExtendAppFromUserland
