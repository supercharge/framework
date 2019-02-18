'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../testing/base-test')
const LoadMiddleware = require('../../../../../foundation/http/bootstrap/load-middleware')

class LoadMiddlewareTest extends BaseTest {
  async loadMiddleware (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const server = {
      ext: async (options) => {
        server.extensions = options
      }
    }

    const handler = new LoadMiddleware()
    handler._middlewareFolder = 'middleware'

    await handler.extends(server)

    t.truthy(server.extensions)
    t.is(server.extensions.type, 'onPreHandler')
    t.truthy(server.extensions.method)
    t.is(server.extensions.options, undefined)
  }
}

module.exports = new LoadMiddlewareTest()
