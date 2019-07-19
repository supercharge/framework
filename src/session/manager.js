'use strict'

const Config = require('../config')
const Drivers = require('./driver')

class SessionManager {
  constructor () {
    this.drivers = new Map()
    this.customCreators = new Map()
  }

  /**
   * Extend the session drivers with a custom implementation.
   *
   * @param {String} name
   * @param {Class} implementation
   */
  extend (name, implementation) {
    this.customCreators.set(name, implementation)
  }

  /**
   * Returns the session config.
   *
   * @returns {Object}
   */
  config () {
    return Config.get('session')
  }

  /**
   * Determines whether the default session driver
   * has a truthy value.
   *
   * @returns {Boolean}
   */
  _sessionConfigured () {
    return !!this._defaultDriver()
  }

  /**
   * Returns an instance of the session driver
   * indentified by `name`.
   *
   * @param {String} name
   *
   * @returns {Object}
   */
  async driver (name = this._defaultDriver()) {
    if (!this._hasDriver(name)) {
      await this._createDriver(name)
    }

    return this.drivers.get(name)
  }

  /**
   * Returns the name of the default session driver.
   *
   * @returns {String}
   */
  _defaultDriver () {
    return Config.get('session.driver')
  }

  /**
   * Determines whether the instantiated session
   * drivers include one with the given `name`.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  _hasDriver (name) {
    return this.drivers.has(name)
  }

  /**
   * Instantiates a session driver identified by `name`.
   *
   * @param {name} name
   *
   * @returns {Object}
   */
  async _createDriver (name) {
    if (this.customCreators.has(name)) {
      return this._createCustomDriver(name)
    }

    if (Drivers[name]) {
      return this._createBuiltInDriver(name)
    }

    throw new Error(`Unavailable session driver “${name}”. Please check config/session.js for available drivers.`)
  }

  /**
   * Create and boot a session driver added
   * by the `.extend()` method.
   *
   * @param {String} name
   *
   * @returns {Object}
   */
  async _createCustomDriver (name) {
    await this._createAndBoot(name, this.customCreators.get(name))
  }

  /**
   * Creates and boots a session driver shipped
   * with Supercharge.
   *
   * @param {String} name
   *
   * @returns {Object}
   */
  async _createBuiltInDriver (name) {
    await this._createAndBoot(name, Drivers[name])
  }

  /**
   * Instantiates and boots the session driver.
   *
   * @param {String} name
   * @param {Class} Driver
   */
  async _createAndBoot (name, Driver) {
    const driver = new Driver(this.config())
    await driver.start()

    this.drivers.set(name, driver)
  }
}

module.exports = new SessionManager()
