'use strict'

const Path = require('path')
const Fs = require('./../../../filesystem')
const Helper = require('./../../../helper')
const Database = require('./../../../database')

class GracefulShutdown {
  constructor () {
    this._lifecycleFile = 'bootstrap/lifecycle.js'
  }

  async extends (server) {
    const { preServerStop, preShutdown } = await this.lifecycleMethods()

    server.register({
      plugin: require('hapi-pulse'),
      options: {
        preServerStop,
        postServerStop: this.postServerStop,
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

  async postServerStop () {
    const { postServerStop = this.noop } = await this.lifecycleMethods()

    await postServerStop()
    await Database.close()
  }

  async noop () {}
}

module.exports = GracefulShutdown
