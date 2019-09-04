'use strict'

const Config = require('../../../config')
const Session = require('../../../session')
const BaseTest = require('../../../base-test')
const Application = require('../../../foundation/application')
const FakeSessionDriver = require('./fixtures/fake-session-driver')
const SessionBootstrapper = require('../../../session/bootstrapper')

class SessionTest extends BaseTest {
  before () {
    Config.set('app.key', 'a'.repeat(32))
    Config.set('session.cookie', { name: 'supercharge-test-cookie' })
  }

  async serialRestoresSessionOnSecondVisit (t) {
    Config.set('session.driver', 'fake-null')
    Session.extend('fake-null', FakeSessionDriver)

    const app = new Application()
    await app.initializeHttpServer()
    await app.register(SessionBootstrapper)

    const driver = Session.driver('fake-null')
    t.truthy(driver)

    const server = app.server

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
