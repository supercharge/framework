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
      return
    }

    server.auth.default(Config.get('auth.default'))
  }
}

module.exports = SetDefaultAuthStrategy
