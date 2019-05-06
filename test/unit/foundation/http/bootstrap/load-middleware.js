'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../base-test')
const LoadMiddleware = require('../../../../../src/foundation/http/bootstrap/load-middleware')

class LoadMiddlewareTest extends BaseTest {
  _provideServer () {
    const server = {
      extensions: [],
      registerMiddleware: async (extensionPoint, method) => {
        if (!method) {
          const { type, method } = extensionPoint
          server.extensions.push({ [type]: method })

          return
        }

        server.extensions.push({ [extensionPoint]: method })
      }
    }

    return server
  }

  async loadMiddleware (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const handler = new LoadMiddleware()
    handler._middlewareFolder = 'middleware/works-fine'

    const server = this._provideServer()
    await handler.extends(server)

    const extensionPoints = server.extensions.map(ext => {
      return Object.keys(ext).shift()
    })

    t.is(server.extensions.length, 2)
    t.true(extensionPoints.includes('onPreHandler'))
    t.true(extensionPoints.includes('onPreResponse'))

    t.is(server.extensions.options, undefined)
  }

  async throwsForInvalidMiddleware (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const server = this._provideServer()
    const handler = new LoadMiddleware()
    handler._middlewareFolder = 'middleware/with-errors'

    await t.throwsAsync(handler.extends(server))
  }
}

module.exports = new LoadMiddlewareTest()
