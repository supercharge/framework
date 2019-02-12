'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../testing/base-test')
const GracefulShutdown = require('../../../../../foundation/http/bootstrap/graceful-shutdown')

class GracefulShutdownTest extends BaseTest {
  async serialShutdownWithLifecycleFile (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const handler = new GracefulShutdown()

    t.is(await handler.lifecycleFile(), Path.resolve(__dirname, 'fixtures', 'bootstrap', 'lifecycle.js'))
    t.true(Object.keys(await handler.lifecycleMethods()).includes('onPreStop'))
  }

  async serialShutdownWithoutLifecycleFile (t) {
    Helper.setAppRoot(__dirname)

    const handler = new GracefulShutdown()

    t.is(await handler.lifecycleFile(), Path.resolve(__dirname, 'bootstrap', 'lifecycle.js'))
    t.is(Object.keys(await handler.lifecycleMethods()).length, 0)
  }
}

module.exports = new GracefulShutdownTest()
