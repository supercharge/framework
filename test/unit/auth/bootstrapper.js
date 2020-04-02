'use strict'

const Path = require('path')
const Config = require('../../../config')
const Helper = require('../../../helper')
const BaseTest = require('../../../base-test')
const Application = require('../../../foundation/application')
const AuthBootstrapper = require('../../../auth/bootstrapper')
const HttpBootstrapper = require('../../../http/bootstrapper')

class AuthBootstrapperTest extends BaseTest {
  async serialLoadSchemesAndStrategies (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const app = new Application()
    await app.register(HttpBootstrapper)
    await app.register(AuthBootstrapper)

    const server = app.server

    server.route({
      method: 'GET',
      path: '/',
      options: {
        auth: {
          strategy: 'class-test-auth'
        },
        handler: (request) => {
          return request.auth.credentials || {}
        }
      }
    })

    const request = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(request)
    t.deepEqual(response.statusCode, 200)
    t.deepEqual(response.result, { name: 'Marcus' })
  }

  async serialNoAuthStrategiesAvailable (t) {
    Config.set('auth.default', 'test-auth')
    Helper.setAppRoot(Path.resolve(__dirname, 'not-existent-folder'))

    const app = new Application()
    await app.register(HttpBootstrapper)
    await app.register(AuthBootstrapper)

    t.pass()
  }

  async serialSetDefaultStrategy (t) {
    Config.set('auth.default', 'test-auth')
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const app = new Application()
    await app.register(HttpBootstrapper)
    await app.register(AuthBootstrapper)

    const server = app.server

    t.deepEqual(server.auth.settings.default.strategies, ['test-auth'])
  }
}

module.exports = new AuthBootstrapperTest()
