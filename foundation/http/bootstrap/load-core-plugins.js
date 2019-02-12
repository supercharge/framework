'use strict'

class LoadCore {
  constructor (app) {
    this.app = app
  }

  async extends (server) {
    await server.register([
      { plugin: require('inert') },
      { plugin: require('vision') },
      { plugin: require('hapi-auth-cookie') },
      { plugin: require('hapi-request-utilities') },
      { plugin: require('hapi-response-utilities') }
    ])

    if (!this.app.isRunningTests()) {
      await server.register({
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

module.exports = LoadCore
