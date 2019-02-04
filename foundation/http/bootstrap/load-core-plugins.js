'use strict'

class LoadCore {
  async extends (server) {
    await server.register([
      { plugin: require('inert') },
      { plugin: require('vision') },
      { plugin: require('hapi-request-utilities') },
      { plugin: require('hapi-response-utilities') },
      {
        plugin: require('laabr'),
        options: {
          formats: { log: 'log.tiny' },
          colored: true,
          hapiPino: { logPayload: false }
        }
      }
    ])
  }
}

module.exports = LoadCore
