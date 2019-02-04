'use strict'

const Path = require('path')
const Fs = require('./../../../filesystem')
const Helper = require('./../../../helper')

class GracefulShutdown {
  constructor () {
    this._lifecycleFile = 'bootstrap/lifecycle.js'
  }

  async extends (server) {
    const { preServerStop, postServerStop, preShutdown } = await this.lifecycleMethods()

    server.register({
      plugin: require('hapi-pulse'),
      options: {
        preServerStop,
        postServerStop,
        preShutdown
      }
    })
  }

  async lifecycleMethods () {
    return await Fs.exists(this.lifecycleFile())
      ? require(this.lifecycleFile())
      : {}
  }

  lifecycleFile () {
    return Path.resolve(Helper.appRoot(), this._lifecycleFile)
  }
}

module.exports = GracefulShutdown
