'use strict'

const Path = require('path')
const Config = require('./index')
const Helper = require('../helper')

class ConfigBootstrapper {
  /**
   * Load the environment information from a `.env` file
   * into memory. All env vars can then be used via
   * the configuration utility.
   */
  async boot () {
    await Config.loadConfigFiles(
      Path.resolve(Helper.appRoot(), 'config')
    )
  }
}

module.exports = ConfigBootstrapper
