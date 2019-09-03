'use strict'

const Env = require('../../../../../env')
const Config = require('../../../../../config')
const BaseTest = require('../../../../../base-test')
const Application = require('../../../../../foundation/application')
const SessionBootstrapper = require('../../../../../session/bootstrapper')
const VerifyCsrf = require('../../../../../http/middleware/verify-csrf-token')

class CsrfMiddlewareTest extends BaseTest {
  before () {
    Config.set('app.key', 'a'.repeat(32))
    Config.set('session.driver', 'cookie')
    Config.set('session.cookie', {
      name: 'supercharge-test-cookie',
      encoding: 'base64json'
    })
  }

  async beforeEach () {
    const app = new Application()
    await app.initializeHttpServer()
    await app.registerBootstrapper(SessionBootstrapper)

    this.server = app.server
    this.server.extClass(VerifyCsrf)
  }

  async serialIsReading (t) {
    this.server.route({
      path: '/',
      method: 'GET',
      handler: request => request.session.all()
    })

    const request = {
      url: '/',
      method: 'GET'
    }

    const response = await this.server.inject(request)

    t.deepEqual(response.statusCode, 200)
    t.is(Object.keys(response.result).length, 1)
    t.true(Object.keys(response.result).includes('_csrfToken'))
    t.true(response.headers['set-cookie'][1].includes('XSRF-TOKEN='))
  }

  async serialIsTesting (t) {
    const env = Env.get('NODE_ENV')
    Env.set('NODE_ENV', 'testing')

    this.server.route({
      path: '/',
      method: 'POST',
      handler: request => request.session.all()
    })

    const request = {
      url: '/',
      method: 'POST'
    }

    const response = await this.server.inject(request)

    t.deepEqual(response.statusCode, 200)
    t.is(Object.keys(response.result).length, 1)
    t.true(Object.keys(response.result).includes('_csrfToken'))
    t.true(response.headers['set-cookie'][1].includes('XSRF-TOKEN='))

    Env.set('NODE_ENV', env)
  }

  async serialTokensMatch (t) {
    Env.set('NODE_ENV', 'development')

    this.server.route(
      [
        {
          path: '/',
          method: 'GET',
          handler: request => request.session.all()
        },
        {
          path: '/',
          method: 'POST',
          handler: request => request.session.all()
        }
      ])

    const get = {
      url: '/',
      method: 'GET'
    }

    const getResponse = await this.server.inject(get)
    t.deepEqual(getResponse.statusCode, 200)

    const tokenInPayload = {
      url: '/',
      method: 'POST',
      payload: getResponse.result,
      headers: {
        cookie: getResponse.headers['set-cookie'][0].split(';')[0]
      }
    }

    const inPayloadResponse = await this.server.inject(tokenInPayload)
    t.deepEqual(inPayloadResponse.statusCode, 200)

    const tokenInHeader = {
      url: '/',
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': getResponse.result._csrfToken,
        cookie: getResponse.headers['set-cookie'][0].split(';')[0]
      }
    }

    const inHeaderResponse = await this.server.inject(tokenInHeader)
    t.deepEqual(inHeaderResponse.statusCode, 200)

    Env.set('NODE_ENV', 'testing')
  }

  async serialForbiddenDueToMissingToken (t) {
    Env.set('NODE_ENV', 'development')

    this.server.route({
      path: '/',
      method: 'POST',
      handler: () => 'ok'
    })

    const request = {
      url: '/',
      method: 'POST'
    }

    const response = await this.server.inject(request)

    t.deepEqual(response.statusCode, 403)

    Env.set('NODE_ENV', 'testing')
  }

  async serialAddToViewContext (t) {
    this.server.route({
      path: '/',
      method: 'POST',
      handler: request => {
        return request.generateResponse({}, {
          variety: 'view',
          marshal: (response) => {
            return response.source.context._csrfToken
          }
        })
      }
    })

    const request = {
      url: '/',
      method: 'POST'
    }

    const response = await this.server.inject(request)
    t.deepEqual(response.statusCode, 200)
    t.truthy(response.payload)
  }
}

module.exports = new CsrfMiddlewareTest()
