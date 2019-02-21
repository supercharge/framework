'use strict'

const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../src/foundation/http/kernel')
const Application = require('../../../../../src/foundation/application')
const LoadCore = require('../../../../../src/foundation/http/bootstrap/load-core-plugins')

class LoadRoutesTest extends BaseTest {
  async corePluginsWithoutLaabr (t) {
    const server = new HttpKernel(new Application()).createServer()
    await server.initialize()

    const handler = new LoadCore(new Application())
    handler._routesFolder = 'routes'

    await handler.extends(server)
    t.falsy(server.registrations['laabr'])
  }

  async corePluginsWithLaabr (t) {
    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)

    const server = new HttpKernel().createServer()
    await server.initialize()

    const handler = new LoadCore(app)
    await handler.extends(server)

    stub.restore()

    t.truthy(server.registrations['laabr'])
  }
}

module.exports = new LoadRoutesTest()
