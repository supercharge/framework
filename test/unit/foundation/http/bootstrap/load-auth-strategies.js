'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../src/foundation/http/kernel')
const Application = require('../../../../../src/foundation/application')
const LoadAuthStrategies = require('../../../../../src/foundation/http/bootstrap/load-auth-strategies')

class LoadAuthStrategiesTest extends BaseTest {
  before () {
    this.scheme = () => {
      return {
        authenticate: (_, h) => {
          return h.authenticated({ credentials: { user: 'marcus' } })
        }
      }
    }
  }

  async serialLoadRoutes (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const server = new HttpKernel(new Application()).createServer()
    await server.initialize()

    server.auth.scheme('test-scheme', this.scheme)

    const handler = new LoadAuthStrategies()
    handler._strategiesFolder = 'auth/strategies'

    await handler.extends(server)

    t.deepEqual(Object.keys(server.auth._strategies), ['test-auth'])
  }

  async serialNoAuthStrategiesAvailable (t) {
    Helper.setAppRoot(Path.resolve(__dirname))

    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)

    const server = new HttpKernel().createServer()
    await server.initialize()

    server.auth.scheme('test-scheme', this.scheme)

    const handler = new LoadAuthStrategies(app)
    handler._strategiesFolder = 'auth/not-a-strategies-folder'

    await handler.extends(server)

    stub.restore()

    t.deepEqual(Object.keys(server.auth._strategies), [])
  }
}

module.exports = new LoadAuthStrategiesTest()
