'use strict'

const BaseTest = require('../../../../base-test')
const Application = require('../../../../foundation/application')
const HttpBootstrapper = require('../../../../http/bootstrapper')

class RegistersCorePluginsTest extends BaseTest {
  async corePluginsWithoutLaabr (t) {
    const app = new Application()

    const bootstrapper = new HttpBootstrapper(app)
    await bootstrapper.registerCorePlugins()
    t.falsy(app.server.registrations.laabr)
  }

  async corePluginsWithLaabr (t) {
    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)

    const kernel = new HttpBootstrapper(app)
    await kernel.registerCorePlugins()

    stub.restore()

    t.truthy(app.server.registrations.laabr)
  }
}

module.exports = new RegistersCorePluginsTest()
