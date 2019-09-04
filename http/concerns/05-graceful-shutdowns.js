'use strict'

const Path = require('path')
const Fs = require('../../filesystem')
const Helper = require('../../helper')

class GracefulShutdowns {
  constructor () {
    this._lifecycleFile = 'bootstrap/lifecycle.js'
  }

  /**
   * Registers a plugin to gracefully shut down the HTTP server.
   * This will also load and assign custom `preServerStop`,
   * `postServerStop`, `preShutdown` methods.
   */
  async _registerShutdownHandler () {
    const { preServerStop, postServerStop, preShutdown } = await this.lifecycleMethods()

    this.server.register({
      plugin: require('hapi-pulse'),
      options: {
        preServerStop,
        postServerStop,
        preShutdown
      }
    })
  }

  /**
   * Loads the lifecycle file contents and returns
   * the object containing the pre/post server
   * stop and pre shutdown handling.
   *
   * @returns {Object}
   */
  async lifecycleMethods () {
    return await Fs.exists(this.lifecycleFile())
      ? require(this.lifecycleFile())
      : {}
  }

  /**
   * Resolves the path to the lifecycle file starting
   * at app root. The file is typically located
   * in `bootstrap/lifecycle.js`.
   *
   * @returns {String}
   */
  lifecycleFile () {
    return Path.resolve(Helper.appRoot(), this._lifecycleFile)
  }
}

module.exports = GracefulShutdowns
