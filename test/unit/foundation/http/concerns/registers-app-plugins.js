'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../src/foundation/http/kernel')
const Application = require('../../../../../src/foundation/application')

class LoadUserPluginsTest extends BaseTest {
  async serialLoadUserPlugins (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const kernel = new HttpKernel(new Application())
    await kernel._createServer()

    kernel._pluginsFolder = 'plugins'
    await kernel._loadAppPlugins()

    t.truthy(kernel.getServer().registrations['test-plugin'])
  }

  async serialNoUserPluginsAvailable (t) {
    Helper.setAppRoot(Path.resolve(__dirname))

    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)

    const kernel = new HttpKernel(new Application())
    await kernel._createServer()

    kernel._pluginsFolder = 'plugins'
    await kernel._loadAppPlugins()

    stub.restore()

    t.deepEqual(kernel.getServer().registrations, {})
  }
}

module.exports = new LoadUserPluginsTest()
