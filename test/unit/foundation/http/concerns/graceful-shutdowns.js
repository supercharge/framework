'use strict'

const Path = require('path')
const Config = require('../../../../../config')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../src/foundation/http/kernel')
const Application = require('../../../../../src/foundation/application')
const GracefulShutdown = require('../../../../../src/foundation/http/concerns/06-graceful-shutdowns')

class GracefulShutdownTest extends BaseTest {
  before () {
    Config.set('database.default', 'mongoose')
    Config.set('database.connections', { mongoose: { database: 'boost' } })
  }

  after () {
    Config.set('database', 'undefined')
  }

  async serialShutdownWithLifecycleFile (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const handler = new GracefulShutdown()

    t.is(await handler._lifecycleFile(), Path.resolve(__dirname, 'fixtures', 'bootstrap', 'lifecycle.js'))
    t.true(Object.keys(await handler._lifecycleMethods()).includes('onPreStop'))
  }

  async registersShutdownHandler (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const kernel = new HttpKernel(new Application())
    await kernel._createServer()

    await kernel._registerShutdownHandler()

    t.truthy(kernel.getServer().registrations['hapi-pulse'])
  }

  async serialShutdownWithoutLifecycleFile (t) {
    Helper.setAppRoot(__dirname)

    const handler = new GracefulShutdown()

    t.is(await handler._lifecycleFile(), Path.resolve(__dirname, 'bootstrap', 'lifecycle.js'))
    t.is(Object.keys(await handler._lifecycleMethods()).length, 0)
  }
}

module.exports = new GracefulShutdownTest()
