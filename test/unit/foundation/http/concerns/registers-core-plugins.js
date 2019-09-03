'use strict'

const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../http/kernel')
const Application = require('../../../../../foundation/application')

class RegistersCorePluginsTest extends BaseTest {
  async corePluginsWithoutLaabr (t) {
    const kernel = new HttpKernel(new Application())
    await kernel._createServer()
    await kernel._registerCorePlugins()
    t.falsy(kernel.getServer().registrations['laabr'])
  }

  async corePluginsWithLaabr (t) {
    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)

    const kernel = new HttpKernel(app)
    await kernel._createServer()
    await kernel._registerCorePlugins()

    stub.restore()

    t.truthy(kernel.getServer().registrations['laabr'])
  }
}

module.exports = new RegistersCorePluginsTest()
