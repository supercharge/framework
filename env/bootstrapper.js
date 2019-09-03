'use strict'

const Env = require('./index')

class EnvBootstrapper {
  /**
   * Load the environment information from a `.env` file
   * into memory. All env vars can then be used via
   * the configuration utility.
   */
  async boot () {
    Env.loadEnvironmentVariables()
  }
}

module.exports = EnvBootstrapper
