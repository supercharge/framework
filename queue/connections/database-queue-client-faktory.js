'use strict'

const MongooseClient = require('./database-queue-mongoose-client')

class DatabaseQueueClientFaktory {
  /**
   * Returns the cached database clients.
   */
  static get drivers () {
    if (!this._drivers) {
      this._drivers = new Map()
    }

    return this._drivers
  }

  /**
   * Creates the database queue client to insert,
   * fetch, or count queue jobs.
   *
   * @param {Object} containing `driver` and `config`
   *
   * @returns {DtabaseQueueClient}
   */
  static make ({ driver, config }) {
    if (this.missing(driver)) {
      this.create(driver, config)
    }

    return this.get(driver)
  }

  /**
   * Determine whether the given `driver` is missing in the cache.
   *
   * @param {String} driver
   *
   * @returns {Boolean}
   */
  static missing (driver) {
    return !this.has(driver)
  }

  /**
   * Determine whether the given `driver` is already cached.
   *
   * @param {String} driver
   *
   * @returns {Boolean}
   */
  static has (driver) {
    return this.drivers.has(driver)
  }

  /**
   * Create a new database client for the given `driver` name.
   *
   * @param {String} driver
   * @param {Object} config
   */
  static create (driver, config) {
    switch (driver) {
      case 'mongoose':
        return this.set(driver, MongooseClient(config))

      default:
        throw new Error(`Unknown database queue driver ${driver}`)
    }
  }

  /**
   * Cache the client instance for the given `driver`.
   *
   * @param {String} driver
   * @param {Object} client
   */
  static set (driver, client) {
    this.drivers.set(driver, client)
  }

  /**
   * Returns the client instance for the given `driver`.
   *
   * @param {String} driver
   *
   * @returns {Object}
   */
  static get (driver) {
    return this.drivers.get(driver)
  }
}

module.exports = DatabaseQueueClientFaktory
