'use strict'

const Path = require('path')
const Config = require('../../../../config')
const Helper = require('../../../../helper')
const BaseTest = require('../../../../base-test')
const Application = require('../../../../foundation/application')
const HttpBootstrapper = require('../../../../http/bootstrapper')

class GracefulShutdownTest extends BaseTest {
  before () {
    this.app = new Application()

    Config.set('database.default', 'mongoose')
    Config.set('database.connections', { mongoose: { database: 'supercharge-testing' } })
  }

  after () {
    Config.set('database', 'undefined')
  }

  async serialShutdownWithLifecycleFile (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const handler = new HttpBootstrapper(this.app)
    await handler.registerShutdownHandler()

    t.is(await handler.lifecycleFile(), Path.resolve(__dirname, 'fixtures/bootstrap/lifecycle.js'))
    t.true(Object.keys(await handler.lifecycleMethods()).includes('onPreStop'))
  }

  async registersShutdownHandler (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const handler = new HttpBootstrapper(this.app)
    await handler.registerShutdownHandler()

    t.truthy(handler.app.server.registrations['hapi-pulse'])
  }

  async serialShutdownWithoutLifecycleFile (t) {
    Helper.setAppRoot(__dirname)

    const handler = new HttpBootstrapper(this.app)
    await handler.registerShutdownHandler()

    t.is(await handler.lifecycleFile(), Path.resolve(__dirname, 'bootstrap/lifecycle.js'))
    t.is(Object.keys(await handler.lifecycleMethods()).length, 0)
  }
}

module.exports = new GracefulShutdownTest()
