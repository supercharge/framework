'use strict'

const Env = require('../../../../../env')
const Config = require('../../../../../config')
const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../http/kernel')
const Application = require('../../../../../foundation/application')
const SessionBootstrapper = require('../../../../../session/bootstrapper')
const VerifyCsrf = require('../../../../../http/middleware/verify-csrf-token')

class CsrfMiddlewareTest extends BaseTest {
  before () {
    Config.set('app.key', 'a'.repeat(32))
    Config.set('session.driver', 'cookie')
    Config.set('session.cookie', {
      name: 'supercharge-test-cookie',
      encoding: 'form'
    })
  }

  async beforeEach () {
    const kernel = new HttpKernel(new Application())
    await kernel._createServer()
    await kernel._registerCorePlugins()
    await kernel._registerBootstrapper(SessionBootstrapper)

    this.server = kernel.getServer()
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

    const post = {
      url: '/',
      method: 'POST',
      payload: getResponse.result
    }

    const postResponse = await this.server.inject(post)
    t.deepEqual(postResponse.statusCode, 200)

    Env.set('NODE_ENV', 'testing')
  }
}

module.exports = new CsrfMiddlewareTest()
