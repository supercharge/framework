'use strict'

const Path = require('path')
const Helper = require('../../../../helper')
const BaseTest = require('../../../../base-test')
const Application = require('../../../../foundation/application')
const HttpBootstrapper = require('../../../../http/bootstrapper')

class LoadUserPluginsTest extends BaseTest {
  async serialLoadUserPlugins (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const app = new Application()
    const handler = new HttpBootstrapper(app)
    handler._pluginsFolder = 'plugins'

    await handler.loadAndRegisterAppPlugins()

    t.truthy(app.server.registrations['test-plugin'])
  }

  async serialNoUserPluginsAvailable (t) {
    Helper.setAppRoot(Path.resolve(__dirname))

    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)

    const handler = new HttpBootstrapper(app)

    handler._pluginsFolder = 'plugins'
    await handler.loadAndRegisterAppPlugins()

    stub.restore()

    t.deepEqual(app.server.registrations, {})
  }
}

module.exports = new LoadUserPluginsTest()
