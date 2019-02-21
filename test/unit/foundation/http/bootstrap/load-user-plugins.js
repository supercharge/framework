'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../src/foundation/http/kernel')
const Application = require('../../../../../src/foundation/application')
const LoadUserPlugins = require('../../../../../src/foundation/http/bootstrap/load-user-plugins')

class LoadUserPluginsTest extends BaseTest {
  async serialLoadUserPlugins (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const server = new HttpKernel(new Application()).createServer()
    await server.initialize()

    const handler = new LoadUserPlugins()
    handler._pluginsFolder = 'plugins'

    await handler.extends(server)

    t.truthy(server.registrations['test-plugin'])
  }

  async serialNoUserPluginsAvailable (t) {
    Helper.setAppRoot(Path.resolve(__dirname))

    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)

    const server = new HttpKernel().createServer()
    await server.initialize()

    const handler = new LoadUserPlugins(app)
    handler._routesFolder = 'routes'

    await handler.extends(server)

    stub.restore()

    t.deepEqual(server.registrations, {})
  }
}

module.exports = new LoadUserPluginsTest()
