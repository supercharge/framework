'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../src/foundation/http/kernel')
const Application = require('../../../../../src/foundation/application')
const LoadRoutes = require('../../../../../src/foundation/http/bootstrap/load-routes')

class LoadRoutesTest extends BaseTest {
  async serialLoadRoutes (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const server = new HttpKernel(new Application()).createServer()
    await server.initialize()

    const handler = new LoadRoutes()
    handler._routesFolder = 'routes'

    await handler.extends(server)

    const request = {
      method: 'GET',
      url: '/test-route'
    }

    const response = await server.inject(request)
    t.is(response.statusCode, 200)
  }

  async serialNoRoutesAvailable (t) {
    Helper.setAppRoot(Path.resolve(__dirname))

    this.muteConsole()

    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)

    const server = new HttpKernel().createServer()
    await server.initialize()

    const handler = new LoadRoutes(app)
    handler._routesFolder = 'routes'

    await handler.extends(server)

    stub.restore()

    const { stdout } = this.getConsoleOutput()
    t.true(stdout.includes('No routes detected'))
  }
}

module.exports = new LoadRoutesTest()
