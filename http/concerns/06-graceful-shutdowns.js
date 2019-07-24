'use strict'

const Path = require('path')
const Helper = require('../../helper')
const Fs = require('../../filesystem')

class GracefulShutdowns {
  constructor () {
    this.lifecycleFile = 'bootstrap/lifecycle.js'
  }

  async _registerShutdownHandler () {
    const { preServerStop, postServerStop, preShutdown } = await this._lifecycleMethods()

    this.server.register({
      plugin: require('hapi-pulse'),
      options: {
        preServerStop,
        postServerStop,
        preShutdown
      }
    })
  }

  async _lifecycleMethods () {
    return await Fs.exists(this._lifecycleFile())
      ? require(this._lifecycleFile())
      : {}
  }

  _lifecycleFile () {
    return Path.resolve(Helper.appRoot(), this.lifecycleFile)
  }
}

module.exports = GracefulShutdowns
