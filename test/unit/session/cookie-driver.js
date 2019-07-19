'use strict'

const Hapi = require('hapi')
const BaseTest = require('../../../base-test')
const CookieDriver = require('../../../src/session/driver/cookie')

class SessionCookieDriverTest extends BaseTest {
  _options () {
    return {
      cookie: {
        name: 'supercharge',
        options: {
          encoding: 'base64json'
        }
      }
    }
  }

  async _server () {
    const server = new Hapi.Server()
    await server.register([
      require('hapi-request-utilities'),
      require('hapi-response-utilities')
    ])

    const { cookie } = this._options()
    server.state(cookie.name, cookie.options)

    return server
  }

  _sessionId () {
    const [min, max] = [1, 123456]

    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  async driverStartsAndStops (t) {
    const driver = new CookieDriver(this._options())
    await driver.start()
    await driver.stop()
    t.pass()
  }

  async returnsEmptyObjectWhenMissingCookie (t) {
    const sessionId = this._sessionId()
    const driver = new CookieDriver(this._options())

    const server = await this._server()
    server.route({
      method: 'GET',
      path: '/',
      handler: request => driver.read(sessionId, request)
    })

    const request = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(request)
    t.is(response.statusCode, 200)
    t.deepEqual(response.result, {})
  }

  async writeAndReadSessionValues (t) {
    const sessionId = this._sessionId()
    const driver = new CookieDriver(this._options())

    const server = await this._server()
    server.route({
      method: 'GET',
      path: '/',
      handler: (request, h) => {
        driver.write(sessionId, { name: 'Supercharge' }, h)

        return driver.read(sessionId, request)
      }
    })

    const request = {
      method: 'GET',
      url: '/'
    }

    const empty = await server.inject(request)
    t.is(empty.statusCode, 200)
    t.deepEqual(empty.result, {})

    const requestWithCookie = {
      method: 'GET',
      url: '/',
      headers: {
        cookie: empty.headers['set-cookie'][0].split(';')[0]
      }
    }

    const response = await server.inject(requestWithCookie)
    t.is(response.statusCode, 200)
    t.deepEqual(response.result, { name: 'Supercharge' })
  }

  async touchSession (t) {
    const sessionId = this._sessionId()
    const driver = new CookieDriver(this._options())

    const server = await this._server()
    server.route({
      method: 'GET',
      path: '/',
      handler: (request, h) => {
        driver.touch(sessionId, { name: 'Another Supercharge' }, h)

        return driver.read(sessionId, request)
      }
    })

    const request = {
      method: 'GET',
      url: '/'
    }

    const empty = await server.inject(request)
    t.is(empty.statusCode, 200)

    const requestWithCookie = {
      method: 'GET',
      url: '/',
      headers: {
        cookie: empty.headers['set-cookie'][0].split(';')[0]
      }
    }

    const response = await server.inject(requestWithCookie)
    t.is(response.statusCode, 200)
    t.deepEqual(response.result, { name: 'Another Supercharge' })
  }
}

module.exports = new SessionCookieDriverTest()
