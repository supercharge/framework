'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const Logger = require('../../../../../logging')
const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../http/kernel')
const Application = require('../../../../../foundation/application')
const RegistersRoutes = require('../../../../../http/concerns/04-registers-routes')

class LoadRoutesTest extends BaseTest {
  async serialLoadRoutes (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const kernel = new HttpKernel(new Application())
    await kernel._createServer()

    kernel._routesFolder = 'routes'
    await kernel._loadAndRegisterRoutes()

    const request = {
      method: 'GET',
      url: '/test-route'
    }

    const response = await kernel.getServer().inject(request)
    t.is(response.statusCode, 200)
  }

  async serialNoRoutesAvailable (t) {
    Helper.setAppRoot(Path.resolve(__dirname))

    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)
    const logStub = this.stub(Logger, 'debug').returns()

    const kernel = new HttpKernel(app)
    await kernel._createServer()

    kernel._routesFolder = 'routes'
    await kernel._loadAndRegisterRoutes()

    this.sinon().assert.called(Logger.debug)
    stub.restore()
    logStub.restore()

    t.pass()
  }

  async serialNoRoutesInTesting (t) {
    Helper.setAppRoot(Path.resolve(__dirname))

    const app = new Application()
    const spy = this.spy(app, 'isRunningTests')

    const kernel = new HttpKernel(app)
    await kernel._createServer()

    kernel._routesFolder = 'routes'
    await kernel._loadAndRegisterRoutes()

    t.true(spy.called)
  }
}

module.exports = new LoadRoutesTest()
