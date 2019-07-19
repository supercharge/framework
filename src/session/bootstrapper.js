'use strict'

const Config = require('../config')
const Session = require('./session')
const SessionManager = require('./manager')
const StartSession = require('./middleware/start-session')

class SessionBootstrapper {
  constructor (server) {
    this.server = server
    this.driver = null
    this.manager = SessionManager
  }

  /**
   * Add session support to the HTTP server for a configured session driver.
   * Starts the driver instance, prepares the session cookie and decorates
   * the request with `request.session`. Extends the request lifecycle
   * with a session extension point.
   */
  async boot () {
    if (!this._sessionConfigured()) {
      return
    }

    this.driver = await this._bootSessionDriver()

    this._prepareSessionCookie()
    this._decorateRequest()

    await this.server.extClass(StartSession)
  }

  /**
   * Determines whether a session driver is configured.
   *
   * @returns {Boolean}
   */
  _sessionConfigured () {
    return this.manager._sessionConfigured()
  }

  /**
   * Creates and boots the session driver.
   */
  async _bootSessionDriver () {
    return this.manager.driver()
  }

  /**
   * Initializes the session cookie on the HTTP server.
   */
  _prepareSessionCookie () {
    const defaultOptions = {
      encoding: 'iron',
      password: Config.get('app.key')
    }

    const { cookie } = this.manager.config()
    const { name, options } = cookie

    this.server.state(name, { ...defaultOptions, ...options })
  }

  /**
   * Decorates the HTTP request object with a `request.session` property.
   * This session member contains the session details for each request.
   */
  _decorateRequest () {
    this.server.decorate('request', 'session', (request) => this._sessionDecoration(request), {
      apply: true // ensure the "request.session" decoration for each request
    })
  }

  /**
   * Create a new session instance for the current request.
   *
   * @param {Object} request
   *
   * @returns {Session}
   */
  _sessionDecoration (request) {
    return new Session({
      request,
      driver: this.driver,
      config: this.manager.config()
    })
  }
}

module.exports = SessionBootstrapper
