'use strict'

const _ = require('lodash')
const Uuid = require('uuid/v4')
const Encryption = require('../encryption')

class Session {
  constructor ({ driver, request, config }) {
    this.request = request
    this.driver = driver
    this.config = config

    this.id = null
    this.store = {}
    this.isDirty = false

    const { name } = this.config.cookie
    this.cookieName = name
  }

  /**
   * Initialize the request’s session.
   * Create a new session on first
   * visit or restore an existing session.
   */
  async _initialize () {
    if (this._isFirstVisit()) {
      return this._createNewSession()
    }

    this.id = this._sessionId()
    this.store = await this.driver.read(this.id, this.request) || {}
  }

  /**
   * Persist the session data and
   * add a session cookie to
   * the response.
   *
   * @param {Toolkit} h
   */
  async _persist (h) {
    await this._addCookieToResponse(h)
    await this._saveSession(h)
  }

  /**
   * Determine whether the request
   * has an existing session.
   *
   * @returns {Boolean}
   */
  _isFirstVisit () {
    const cookie = this._sessionCookie()

    return !cookie || !cookie.id
  }

  /**
   * Returns the parsed session cookie.
   *
   * @returns {Object}
   */
  _sessionCookie () {
    return this.request.cookie(this.cookieName)
  }

  /**
   * Extracts the session ID from the
   * session cookie.
   *
   * @returns {Sring}
   */
  _sessionId () {
    const { id } = this._sessionCookie()

    return id
  }

  /**
   * Create a new session.
   */
  _createNewSession () {
    this.id = this._generateSessionId()
    this.store = {}
    this.isDirty = true
    this.rotateToken()
  }

  /**
   * Generate a new session ID.
   *
   * @returns {String}
   */
  _generateSessionId () {
    return Uuid()
  }

  /**
   * Determines whether the session
   * data has changed.
   *
   * @returns {Boolean}
   */
  _hasChanged () {
    return this.isDirty
  }

  /**
   * Add the session cookie to the
   * response to restore the user
   * data on future visits.
   */
  async _addCookieToResponse (h) {
    h.cookie(this.cookieName, { id: this.id })
  }

  /**
   * Save the session data.
   *
   * @param {Toolkit} h
   */
  async _saveSession (h) {
    if (this._hasChanged()) {
      return this.driver.write(this.id, this.store, h)
    }

    await this.driver.touch(this.id, this.store, h)
  }

  /**
   * Remember a key-value-pair in the session.
   *
   * @param {String} key
   * @param {*} value
   */
  set (key, value) {
    typeof key === 'object'
      ? Object.assign(this.store, key)
      : this.store[key] = value

    this.isDirty = true
  }

  /**
   * Remember a key-value pair in the session.
   *
   * @param {String} key
   * @param {*} value
   */
  remember (key, value) {
    return this.set(key, value)
  }

  /**
   * Return the session’s value for `key`.
   *
   * @param {String} key
   * @param {*} defaultValue
   *
   * @returns {*}
   */
  get (key, defaultValue) {
    return this.store[key] || defaultValue
  }

  /**
   * Returns all session data.
   *
   * @returns {Object}
   */
  all () {
    return _.cloneDeep(this.store)
  }

  /**
   * Returns the value for `key` if existing or
   * `defaultValue`. If existent, removes
   * the key from the session.
   *
   * @param {String} key
   * @param {*} defaultValue
   *
   * @returns {*}
   */
  pull (key, defaultValue) {
    const value = this.get(key, defaultValue)
    this.forget(key)

    return value
  }

  /**
   * Removes `key` and related data
   * from the session.
   *
   * @param {String} key
   */
  forget (key) {
    if (this.has(key)) {
      _.unset(this.store, key)
      this.isDirty = true
    }
  }

  /**
   * Deletes all data in the session.
   */
  clear () {
    this.store = {}
    this.isDirty = true
  }

  /**
   * Keep the session alive.
   */
  touch () {
    this.isDirty = true
  }

  /**
   * Determines whether the session has a
   * value for `key`.
   *
   * @param {String} key
   *
   * @returns {Boolean}
   */
  has (key) {
    return Object.prototype.hasOwnProperty.call(this.store, key)
  }

  /**
   * Retrieves the CSRF token.
   *
   * @returns {String}
   */
  token () {
    return this.get('_csrfToken')
  }

  /**
   * Rotates the CSRF token and saves
   * the new token in the session.
   */
  rotateToken () {
    this.set('_csrfToken', Encryption.randomKey(40))
  }
}

module.exports = Session
