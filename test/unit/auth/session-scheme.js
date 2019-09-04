'use strict'

const Path = require('path')
const Boom = require('@hapi/boom')
const Helper = require('../../../helper')
const BaseTest = require('../../../base-test')
const AuthBootstrapper = require('../../../auth/bootstrapper')
const Application = require('../../../foundation/application')

class SessionAuthTest extends BaseTest {
  async beforeEach () {
    Helper.setAppRoot(Path.resolve(__dirname, 'load-only-the-default-scheme'))

    const app = new Application()
    await app.initializeHttpServer()
    await app.register(AuthBootstrapper)

    this.server = app.server
  }

  _addRoute () {
    this.server.route({
      method: 'GET',
      path: '/',
      options: {
        auth: {
          strategy: 'web'
        },
        handler: (request) => {
          return request.auth.credentials || {}
        }
      }
    })
  }

  async serialSucceedingSessionAuth (t) {
    this.server.auth.strategy('web', 'session', {
      validate: async () => {
        return { credentials: 'Marcus' }
      }
    })

    this._addRoute()

    const request = {
      method: 'GET',
      url: '/'
    }

    const response = await this.server.inject(request)
    t.deepEqual(response.statusCode, 200)
    t.deepEqual(response.result, 'Marcus')
  }

  async serialFailingSessionAuth (t) {
    this.server.auth.strategy('web', 'session', {
      validate: async () => {
        return { credentials: null }
      }
    })

    this._addRoute()

    const request = {
      method: 'GET',
      url: '/'
    }

    const response = await this.server.inject(request)
    t.deepEqual(response.statusCode, 401)
  }

  async serialThrowingInStrategy (t) {
    this.server.auth.strategy('web', 'session', {
      validate: async () => {
        throw Boom.notFound('User not found')
      }
    })

    this._addRoute()

    const request = {
      method: 'GET',
      url: '/'
    }

    const response = await this.server.inject(request)
    t.deepEqual(response.statusCode, 404)
  }
}

module.exports = new SessionAuthTest()
