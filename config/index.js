'use strict'

const _ = require('lodash')
const Fs = require('../filesystem')
const RequireAll = require('require-all')

/**
 * This is the central application configuration.
 * Manage the configuration by reading all
 * `.js` files from the `config` folder.
 */
class Config {
  /**
   * Initialize the configuration instance.
   */
  constructor (items = {}) {
    this.config = items
  }

  /**
   * Returns the current configuration.
   *
   * @returns {Object}
   */
  getConfig () {
    return this.config
  }

  /**
   * Import all application configuration items from the given `path`.
   */
  async loadConfigFiles (path) {
    if (await Fs.exists(path)) {
      this.config = RequireAll({
        dirname: path,
        filter: /(.*)\.js$/
      })
    }
  }

  /**
   * Returns the requested config value.
   *
   * @param {String} key
   * @param {Mixed} defaultValue
   *
   * @returns {Mixed}
   */
  get (key, defaultValue) {
    return _.get(this.config, key, defaultValue)
  }

  /**
   * Set a config value.
   *
   * @param {String} key
   * @param {Mixed} value
   *
   * @returns {Mixed}
   */
  set (key, value) {
    return _.set(this.config, key, value)
  }

  /**
   * Determines whether the configuration contains an application key.
   *
   * @returns {Boolean}
   */
  hasAppKey () {
    return !!this.get('app.key')
  }
}

module.exports = new Config()
