'use strict'

const Path = require('path')
const Config = require('../../../config')
const Helper = require('../../../helper')
const Fs = require('../../../filesystem')
const Session = require('../../../session')
const BaseTest = require('../../../base-test')
const HttpKernel = require('../../../http/kernel')
const Application = require('../../../foundation/application')
const FakeSessionDriver = require('./fixtures/fake-session-driver')
const SessionBootstrapper = require('../../../session/bootstrapper')

class SessionBootstrapperTest extends BaseTest {
  before () {
    Config.set('app.key', 'a'.repeat(32))
    Config.set('session.cookie', { name: 'supercharge-test-cookie' })
  }

  async serialDoesNotRegisterBootstrapperWithoutConfig (t) {
    Config.set('session.driver', null)

    const kernel = new HttpKernel(new Application())
    await kernel._loadAndRegisterPlugins()
    await kernel._registerBootstrapper(SessionBootstrapper)

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
    await kernel._loadAndRegisterPlugins()
    await kernel._registerBootstrapper(SessionBootstrapper)

    const server = kernel.getServer()
    await server.start()
    t.true(await Session._hasDriver('fake-null'))
    await server.stop()
  }

  async serialIgnoresUnknownSessionDriver (t) {
    Config.set('session.driver', 'fake-null')
    Session.extend('fake-null', FakeSessionDriver)

    const kernel = new HttpKernel(new Application())
    await kernel._loadAndRegisterPlugins()
    await kernel._registerBootstrapper(SessionBootstrapper)

    await t.notThrowsAsync(async () => Session._stopDriver('not-existing'))
  }

  async serialAppendsResponseSessionCookie (t) {
    Config.set('session.driver', 'fake-null')
    Session.extend('fake-null', FakeSessionDriver)

    const kernel = new HttpKernel(new Application())
    await kernel._loadAndRegisterPlugins()
    await kernel._registerBootstrapper(SessionBootstrapper)

    const server = kernel.getServer()

    server.route({
      method: 'GET',
      path: '/',
      handler: request => {
        t.truthy(request.session)
        t.truthy(request.session.id)

        const token = request.session.pull('_csrfToken')
        t.truthy(token)
        t.deepEqual(request.session.all(), {})

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
    await kernel._loadAndRegisterPlugins()

    await t.throwsAsync(async () => kernel._registerBootstrapper(SessionBootstrapper))
  }

  async serialUsesBootBuiltInDriver (t) {
    Config.set('session.driver', 'file')
    const sessionsDir = Path.resolve(__dirname, 'fixtures/sessions')
    Helper.setAppRoot(sessionsDir)

    const kernel = new HttpKernel(new Application())
    await kernel._loadAndRegisterPlugins()
    await kernel._registerBootstrapper(SessionBootstrapper)

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

  async serialPreparesCookiesWithLifetime (t) {
    Config.set('session.driver', 'file')
    Config.set('session.lifetime', '1m')

    const kernel = new HttpKernel(new Application())
    await kernel._loadAndRegisterPlugins()
    await kernel._registerBootstrapper(SessionBootstrapper)

    const server = kernel.getServer()

    t.true(Object.keys(server.states.cookies).includes('supercharge-test-cookie', 'XSRF-TOKEN'))
  }
}

module.exports = new SessionBootstrapperTest()
