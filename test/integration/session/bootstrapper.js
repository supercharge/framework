'use strict'

const Config = require('../../../config')
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

  async serialAppendsResponseSessionCookie (t) {
    Config.set('session.driver', 'fake-null')
    Session.extend('fake-null', FakeSessionDriver)

    const kernel = new HttpKernel(new Application())
    await kernel._loadCorePlugins()
    await kernel._registerBootstrapper(SessionBootstrapper)

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

    await t.throwsAsync(async () => kernel._registerBootstrapper(SessionBootstrapper))
  }

  async serialUsesBootBuiltInDriver (t) {
    Config.set('session.driver', 'file')

    const kernel = new HttpKernel(new Application())
    await kernel._loadCorePlugins()
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
  }

  //   async serialUsesBootBuiltInDriver (t) {
  //     Config.set('session.driver', 'file')

  //     const sessionsDir = Path.resolve(__dirname, 'fixtures')
  //     Helper.setAppRoot(sessionsDir)

  //     const kernel = new HttpKernel(new Application())
  //     kernel.bootstrappers.push(
  //       Path.resolve(__dirname, '../../../src/session/bootstrapper')
  //     )

  //     await kernel.bootstrap()
  //     const server = kernel.getServer()

  //     server.route({
  //       method: 'GET',
  //       path: '/',
  //       handler: request => {
  //         t.truthy(request.session)

  //         return 'ok'
  //       }
  //     })

  //     const request = {
  //       method: 'GET',
  //       url: '/'
  //     }

  //     const response = await server.inject(request)
  //     t.is(response.statusCode, 200)

  //     const file = await Fs.readDir(`${Helper.storagePath('framework/sessions')}`)
  //     console.log(file)
  //     console.log(file)
  //     console.log(file)
  //     console.log(file)

  // await Fs.remove(sessionsDir)
//   }
}

module.exports = new SessionBootstrapperTest()
