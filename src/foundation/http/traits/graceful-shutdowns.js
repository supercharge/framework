'use strict'

const Path = require('path')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')
const Database = require('../../../database')

class GracefulShutdowns {
  constructor () {
    this._lifecycleFile = 'bootstrap/lifecycle.js'
  }

  async _registerShutdownHandler () {
    const { preServerStop, preShutdown } = await this._lifecycleMethods()

    this.server.register({
      plugin: require('hapi-pulse'),
      options: {
        preServerStop,
        postServerStop: async () => this._postServerStop,
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
    return Path.resolve(Helper.appRoot(), this._lifecycleFile)
  }

  async _postServerStop () {
    const { postServerStop = this.noop } = await this._lifecycleMethods()

    await postServerStop()
    await Database.close()
  }

  async noop () {}
}

module.exports = GracefulShutdowns
