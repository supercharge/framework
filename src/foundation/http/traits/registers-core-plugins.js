'use strict'

class RegistersCorePlugins {
  constructor () {
    this._pluginsFolder = 'app/plugins'
  }

  async _loadCorePlugins () {
    await this.server.register([
      { plugin: require('inert') },
      { plugin: require('vision') },
      { plugin: require('hapi-auth-cookie') },
      { plugin: require('hapi-request-utilities') },
      { plugin: require('hapi-response-utilities') }
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
