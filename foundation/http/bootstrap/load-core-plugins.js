'use strict'

const Config = require('../../../config')

class LoadCore {
  async extends (server) {
    await server.register([
      { plugin: require('inert') },
      { plugin: require('vision') },
      { plugin: require('hapi-auth-cookie') },
      { plugin: require('hapi-request-utilities') },
      { plugin: require('hapi-response-utilities') }
    ])

    // TODO: find a better way to exclude plugins during testing
    if (Config.get('app.env') !== 'testing') {
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
