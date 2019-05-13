'use strict'

const Config = require('../config')
const Drivers = require('./driver')

class SessionManager {
  constructor () {
    this.drivers = new Map()
    this.customCreators = new Map()
  }

  extends (name, implementation) {
    this.customCreators.set(name, implementation)
  }

  config () {
    return Config.get('session')
  }

  _sessionConfigured () {
    return !!this._defaultDriver()
  }

  async driver (name = this._defaultDriver()) {
    if (!this._hasDriver(name)) {
      await this._createDriver(name)
    }

    return this.drivers.get(name)
  }

  _defaultDriver () {
    return Config.get('session.driver')
  }

  _hasDriver (name) {
    if (!name) {
      throw new Error('Missing “name” on Session.hasDriver(name)')
    }

    return this.drivers.has(name)
  }

  async _createDriver (name) {
    if (this.customCreators.has(name)) {
      return this._createCustomDriver(name)
    }

    if (Drivers[name]) {
      return this._createBuiltInDriver(name)
    }

    throw new Error(`Unavailable session driver “${name}”. Please check config/session.js for available drivers.`)
  }

  async _createCustomDriver (name) {
    await this._createAndBoot(name, this.customCreators.get(name))
  }

  async _createBuiltInDriver (name) {
    await this._createAndBoot(name, Drivers[name])
  }

  async _createAndBoot (name, Driver) {
    const driver = new Driver(this.config())
    await driver.start()

    this.drivers.set(name, driver)
  }
}

module.exports = new SessionManager()
