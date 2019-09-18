'use strict'

const Path = require('path')
const Helper = require('../../../../helper')
const Logger = require('../../../../logging')
const BaseTest = require('../../../../base-test')
const Application = require('../../../../foundation/application')
const RoutingBootstrapper = require('../../../../http/routing-bootstrapper')

class LoadRoutesTest extends BaseTest {
  async serialLoadRoutes (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const app = new Application()
    const kernel = new RoutingBootstrapper(app)

    kernel._routesFolder = 'routes'
    await kernel.loadAndRegisterRoutes()

    const request = {
      method: 'GET',
      url: '/test-route'
    }

    const response = await app.server.inject(request)
    t.is(response.statusCode, 200)
  }

  async serialNoRoutesAvailable (t) {
    Helper.setAppRoot(Path.resolve(__dirname))

    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)
    const logStub = this.stub(Logger, 'debug').returns()

    const kernel = new RoutingBootstrapper(app)

    kernel._routesFolder = 'routes'
    await kernel.loadAndRegisterRoutes()

    this.sinon().assert.called(Logger.debug)
    stub.restore()
    logStub.restore()

    t.pass()
  }

  async serialNoRoutesInTesting (t) {
    Helper.setAppRoot(Path.resolve(__dirname))

    const app = new Application()
    const spy = this.spy(app, 'isRunningTests')

    const kernel = new RoutingBootstrapper(app)

    kernel._routesFolder = 'routes'
    await kernel.loadAndRegisterRoutes()

    t.true(spy.called)
  }
}

module.exports = new LoadRoutesTest()
