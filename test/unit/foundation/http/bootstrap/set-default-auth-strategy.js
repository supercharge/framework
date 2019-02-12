'use strict'

const Config = require('../../../../../config')
const BaseTest = require('../../../../../testing/base-test')
const DefaultAuth = require('../../../../../foundation/http/bootstrap/set-default-auth-strategy')

class DefaultAuthTest extends BaseTest {
  async noAuthWithoutDefault (t) {
    Config.set('auth.default', undefined)
    const server = {}

    const handler = new DefaultAuth()
    await handler.extends(server)

    t.deepEqual(server, {})
  }

  async noAuthWithoutStrategies (t) {
    Config.set('auth.default', 'basic')
    const server = { auth: { _strategies: [] } }

    const handler = new DefaultAuth()
    await handler.extends(server)

    t.deepEqual(server, { auth: { _strategies: [] } })
  }

  async setsDefaultAuthStrategy (t) {
    Config.set('auth.default', 'basic')

    const server = {
      auth: {
        strategy: '',
        _strategies: ['basic'],
        default: function (name) {
          this.strategy = name
        }
      }
    }

    const handler = new DefaultAuth()
    await handler.extends(server)

    t.deepEqual(server.auth.strategy, 'basic')
  }
}

module.exports = new DefaultAuthTest()
