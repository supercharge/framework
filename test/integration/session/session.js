'use strict'

const Config = require('../../../config')
const BaseTest = require('../../../base-test')
const Session = require('../../../src/session/manager')
const SessionManager = require('../../../src/session/manager')
const HttpKernel = require('../../../src/foundation/http/kernel')
const Application = require('../../../src/foundation/application')
const FakeSessionDriver = require('./fixtures/fake-session-driver')
const SessionBootstrapper = require('../../../src/session/bootstrapper')

class SessionTest extends BaseTest {
  before () {
    Config.set('app.key', 'a'.repeat(32))
    Config.set('session.cookie', { name: 'supercharge-test-cookie' })
  }

  async serialRestoresSessionOnSecondVisit (t) {
    Config.set('session.driver', 'fake-null')
    Session.extend('fake-null', FakeSessionDriver)

    const kernel = new HttpKernel(new Application())
    await kernel._loadCorePlugins()
    await kernel._startBootstrapper(SessionBootstrapper)

    const driver = SessionManager.driver('fake-null')
    t.truthy(driver)

    const server = kernel.getServer()

    let sessionId

    server.route({
      method: 'GET',
      path: '/',
      handler: request => {
        t.truthy(request.session)
        t.truthy(request.session.id)

        if (sessionId) {
          t.is(request.session.id, sessionId)
        }

        sessionId = request.session.id

        return 'ok'
      }
    })

    const request = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(request)
    t.is(response.statusCode, 200)

    const cookieValues = response.headers['set-cookie']

    const subsequentRequest = {
      ...request,
      headers: {
        cookie: cookieValues[0].split(';')[0]
      }
    }

    const secondResponse = await server.inject(subsequentRequest)
    t.is(secondResponse.statusCode, 200)
  }
}

module.exports = new SessionTest()
