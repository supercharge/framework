'use strict'

const LoadBootstrappers = require('./02-loads-userland-bootstrappers')

class RegistersCorePlugins extends LoadBootstrappers {
  async _loadAndRegisterPlugins () {
    await this._registerCorePlugins()
  }

  async _registerCorePlugins () {
    await this.server.register([
      { plugin: require('@hapi/vision') },
      { plugin: require('hapi-request-utilities') },
      { plugin: require('hapi-response-utilities') },
      { plugin: require('hapi-class-extension-points') }
    ])

    if (!this.app.isRunningTests()) {
      await this.server.register({
        plugin: require('laabr'),
        options: {
          formats: { log: 'log.tiny' },
          colored: true,
          hapiPino: { logPayload: false }
        }
      })
    }
  }
}

module.exports = RegistersCorePlugins
