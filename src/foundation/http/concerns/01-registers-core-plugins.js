'use strict'

const LoadBootstrappers = require('./02-loads-userland-bootstrappers')

class RegistersCorePlugins extends LoadBootstrappers {
  async _loadCorePlugins () {
    await this.server.register([
      { plugin: require('inert') },
      { plugin: require('vision') },
      { plugin: require('@hapi/cookie') },
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
