'use strict'

const Config = require('../config')
const Session = require('./session')
const SessionManager = require('./manager')
const StartSession = require('./middleware/start-session')

class SessionProvider {
  constructor (server) {
    this.server = server
    this.driver = null
    this.manager = SessionManager
  }

  async boot () {
    if (!this._sessionConfigured()) {
      return
    }

    this.driver = await this._bootSessionDriver()

    this._prepareSessionCookie()
    this._decorateRequest()

    await this.server.extClass(StartSession)
  }

  _sessionConfigured () {
    return !!this.manager._sessionConfigured()
  }

  async _bootSessionDriver () {
    return this.manager.driver()
  }

  _server () {
    return this.server.getServer()
  }

  _prepareSessionCookie () {
    const defaultOptions = {
      encoding: 'iron',
      password: Config.get('app.key')
    }

    const config = this.manager.config()
    const { name, options } = config.cookie

    this._server().state(name, Object.assign({}, defaultOptions, options))
  }

  _decorateRequest () {
    this._server().decorate('request', 'session', (request) => this._sessionDecoration(request), {
      apply: true // ensure the "request.session" decoration for each request
    })
  }

  _sessionDecoration (request) {
    return new Session({
      request,
      driver: this.driver,
      config: this.manager.config()
    })
  }
}

module.exports = SessionProvider
