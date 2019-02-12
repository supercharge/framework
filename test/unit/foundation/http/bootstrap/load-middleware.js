'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../testing/base-test')
const LoadMiddleware = require('../../../../../foundation/http/bootstrap/load-middleware')

class LoadMiddlewareTest extends BaseTest {
  async loadMiddleware (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const server = {
      register: async ({ plugin }) => {
        await plugin.register(server)
      }
    }

    const handler = new LoadMiddleware()
    handler._middlewareFolder = 'middleware'

    await handler.extends(server)

    t.deepEqual(server.testing, 'Supercharge')
  }
}

module.exports = new LoadMiddlewareTest()
