'use strict'

const Path = require('path')
const Config = require('../../../config')
const Helper = require('../../../helper')
const Fs = require('../../../filesystem')
const BaseTest = require('../../../base-test')
const Session = require('../../../src/session/manager')
const HttpKernel = require('../../../src/foundation/http/kernel')
const Application = require('../../../src/foundation/application')
const FakeSessionDriver = require('./fixtures/fake-session-driver')
const SessionBootstrapper = require('../../../src/session/bootstrapper')

class SessionBootstrapperTest extends BaseTest {
  before () {
    Config.set('app.key', 'a'.repeat(32))
    Config.set('session.cookie', { name: 'supercharge-test-cookie', options: {} })
  }

  async serialDoesNotRegisterBootstrapperWithoutConfig (t) {
    Config.set('session.driver', null)

    const kernel = new HttpKernel(new Application())
    await kernel._loadCorePlugins()
    await kernel._startBootstrapper(SessionBootstrapper)

    const server = kernel.getServer()

    server.route({
      method: 'GET',
      path: '/',
      handler: request => {
        t.is(request.session, undefined)

        return 'ok'
      }
    })

    const request = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(request)
    t.is(response.statusCode, 200)

    t.is(response.headers['set-cookie'], undefined)
  }

  async serialStartAndStopTheSessionDriver (t) {
    Config.set('session.driver', 'fake-null')
    Session.extend('fake-null', FakeSessionDriver)

    const kernel = new HttpKernel(new Application())
    await kernel._loadCorePlugins()
    await kernel._startBootstrapper(SessionBootstrapper)

    const server = kernel.getServer()
    await server.start()
    t.true(await Session._hasDriver('fake-null'))
    await server.stop()
  }

  async serialIgnoresUnknownSessionDriver (t) {
    Config.set('session.driver', 'fake-null')
    Session.extend('fake-null', FakeSessionDriver)

    const kernel = new HttpKernel(new Application())
    await kernel._loadCorePlugins()
    await kernel._startBootstrapper(SessionBootstrapper)

    await t.notThrowsAsync(async () => Session._stopDriver('not-existing'))
  }

  async serialAppendsResponseSessionCookie (t) {
    Config.set('session.driver', 'fake-null')
    Session.extend('fake-null', FakeSessionDriver)

    const kernel = new HttpKernel(new Application())
    await kernel._loadCorePlugins()
    await kernel._startBootstrapper(SessionBootstrapper)

    const server = kernel.getServer()

    server.route({
      method: 'GET',
      path: '/',
      handler: request => {
        t.truthy(request.session)
        t.truthy(request.session.id)
        t.deepEqual(request.session.store, {})

        return 'ok'
      }
    })

    const request = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(request)
    t.is(response.statusCode, 200)

    const cookieValues = response.headers['set-cookie'][0].split(';')
    t.true(cookieValues[0].includes('supercharge-test-cookie'))
  }

  async serialFailsToBootWithUnknownDriver (t) {
    Config.set('session.driver', 'unknown-driver')

    const kernel = new HttpKernel(new Application())
    await kernel._loadCorePlugins()

    await t.throwsAsync(async () => kernel._startBootstrapper(SessionBootstrapper))
  }

  async serialUsesBootBuiltInDriver (t) {
    Config.set('session.driver', 'file')
    const sessionsDir = Path.resolve(__dirname, 'fixtures/sessions')
    Helper.setAppRoot(sessionsDir)

    const kernel = new HttpKernel(new Application())
    await kernel._loadCorePlugins()
    await kernel._startBootstrapper(SessionBootstrapper)

    const server = kernel.getServer()

    server.route({
      method: 'GET',
      path: '/',
      handler: request => {
        t.truthy(request.session)

        return 'ok'
      }
    })

    const request = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(request)
    t.is(response.statusCode, 200)

    const files = await Fs.readDir(`${Helper.storagePath('framework/sessions')}`)
    t.is(files.length, 1)

    await Fs.remove(sessionsDir)
  }
}

module.exports = new SessionBootstrapperTest()
