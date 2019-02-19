'use strict'

const Path = require('path')
const Config = require('../../../../../config')
const Helper = require('../../../../../helper')
const Database = require('../../../../../database')
const BaseTest = require('../../../../../testing/base-test')
const GracefulShutdown = require('../../../../../foundation/http/bootstrap/graceful-shutdown')

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

    t.is(await handler.lifecycleFile(), Path.resolve(__dirname, 'fixtures', 'bootstrap', 'lifecycle.js'))
    t.true(Object.keys(await handler.lifecycleMethods()).includes('onPreStop'))
  }

  async serialShutdownWithoutLifecycleFile (t) {
    Helper.setAppRoot(__dirname)

    const handler = new GracefulShutdown()

    t.is(await handler.lifecycleFile(), Path.resolve(__dirname, 'bootstrap', 'lifecycle.js'))
    t.is(Object.keys(await handler.lifecycleMethods()).length, 0)
  }

  async serialGracefulShutdown (t) {
    Helper.setAppRoot(__dirname)
    await Database.connect()

    const handler = new GracefulShutdown()
    await handler.postServerStop()

    t.deepEqual(Database.connections, {})
  }
}

module.exports = new GracefulShutdownTest()
