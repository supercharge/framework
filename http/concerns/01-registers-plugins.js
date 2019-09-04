'use strict'

const RegistersAppPlugins = require('./02-registers-app-plugins')

class RegistersCorePlugins extends RegistersAppPlugins {
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
