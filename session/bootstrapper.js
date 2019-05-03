'use strict'

const Config = require('../config')
const Session = require('./session')
const SessionManager = require('./manager')
const StartSession = require('./middleware/start-session')

class SessionProvider {
  constructor (app) {
    this.app = app
    this.driver = null
    this.manager = SessionManager
  }

  async boot () {
    if (!this.sessionConfigured()) {
      return
    }

    this.driver = await this.bootSessionDriver()

    this.prepareCookie()
    this.decorateRequest()

    await this.app.registerMiddleware(StartSession)
  }

  sessionConfigured () {
    return !!this.manager.sessionConfigured()
  }

  async bootSessionDriver () {
    return this.manager.driver()
  }

  server () {
    return this.app.getServer()
  }

  prepareCookie () {
    const defaultOptions = {
      encoding: 'iron',
      password: Config.get('app.key')
    }

    const config = this.manager.config()
    const { name, options } = config.cookie

    this.server().state(name, Object.assign({}, defaultOptions, options))
  }

  decorateRequest () {
    this.server().decorate('request', 'session', (request) => this.sessionDecoration(request), {
      apply: true // ensures that this.sessionDecoration will be invoked
    })
  }

  sessionDecoration (request) {
    return new Session({
      request,
      driver: this.driver,
      config: this.manager.config()
    })
  }
}

module.exports = SessionProvider
