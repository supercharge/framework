'use strict'

class Manager {
  constructor (drivers) {
    this.drivers = new Map()
    this.customCreators = new Map()
    this.builtInDrivers = new Map(Object.entries(drivers))
  }

  /**
   * Extend the drivers with a custom implementation.
   *
   * @param {String} name
   * @param {Class} implementation
   */
  extend (name, implementation) {
    this.customCreators.set(name, implementation)
  }

  /**
   * Returns an instance of driver indentified by `name`.
   * If the dirver instance doesn't exist yet, it will
   * be created and cached for recurring usage.
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

    if (this.builtInDrivers.has(name)) {
      return this._createBuiltInDriver(name)
    }

    throw new Error(`Unavailable driver “${name}”. Please check config/session.js for available drivers.`)
  }

  /**
   * Add a session driver instance to the internal cache.
   *
   * @param {String} name
   * @param {Object} driver
   */
  _addDriver (name, driver) {
    this.drivers.set(name, driver)
  }

  /**
   * Remove a session driver instance from the cache.
   * @param {String} name
   */
  _deleteDriver (name) {
    this.drivers.delete(name)
  }

  /**
   * Start the session striver.
   *
   * @param {String} name
   */
  async _startDriver (name) {
    const driver = await this.driver(name)
    await driver.start()
  }

  /**
   * Stop the session driver.
   *
   * @param {String} name
   */
  async _stopDriver (name = this._defaultDriver()) {
    if (this._hasDriver(name)) {
      const driver = await this.driver(name)
      await driver.stop()
      this._deleteDriver(name)
    }
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
    await this._create(name, this.customCreators.get(name))
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
    await this._create(name, this.builtInDrivers.get(name))
  }

  /**
   * Instantiates the session driver.
   *
   * @param {String} name
   * @param {Class} Driver
   */
  async _create (name, Driver) {
    this._addDriver(name, new Driver(this.config()))
  }
}

module.exports = Manager
