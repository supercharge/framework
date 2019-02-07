'use strict'

const _ = require('lodash')
const Config = require('../../../config')

class SetDefaultAuthStrategy {
  async extends (server) {
    if (!Config.get('auth.default')) {
      return
    }

    const strategies = server.auth._strategies

    if (_.isEmpty(strategies)) {
      throw new Error('No authentication strategies registered. Cannot set default strategy.')
    }

    server.auth.default(Config.get('auth.default'))
  }
}

module.exports = SetDefaultAuthStrategy
