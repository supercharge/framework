'use strict'

const Winston = require('winston')
const Config = require('../config')
const Transports = require('./transports')

class LoggingManager {
  constructor () {
    this.drivers = new Map()
  }

  /**
   * Returns the name of the default logging driver.
   *
   * @returns {String}
   */
  _defaultDriver () {
    return Config.get('logging.driver')
  }

  ensureLogger (name = this._defaultDriver()) {
    this.driver(name)
  }

  driver (name = this._defaultDriver()) {
    if (!this._hasDriver(name)) {
      this._createDriver(name)
    }

    return this.drivers.get(name)
  }

  _hasDriver (name) {
    return this.drivers.has(name)
  }

  _createDriver (name) {
    this.drivers.set(name, this._createLogger(name))
  }

  _createLogger (name) {
    const Transport = Transports[name]

    return Winston.createLogger({
      format: Winston.format.combine(
        this.handleErrorLogs()
      )
    }).add(
      new Transport()
    )
  }

  /**
   * Create a log transform instance to handle `Error`
   * instances that log the error stack trace
   * besides the actual error message.
   *
   * @returns {object}
   */
  handleErrorLogs () {
    const formatter = Winston.format(info => {
      return info instanceof Error
        ? Object.assign({ message: `${info.message}\n${info.stack}` }, info)
        : info
    })

    return formatter()
  }

  /**
   * Log a 'silly' level message.
   *
   * @param {String} message
   * @param  {...Mixed} options
   */
  silly (message, ...options) {
    this.driver().silly(message, ...options)
  }

  /**
   * Log a 'debug' level message.
   *
   * @param {String} message
   * @param  {...Mixed} options
   */
  debug (message, ...options) {
    this.driver().debug(message, ...options)
  }

  /**
   * Log a 'verbose' level message.
   *
   * @param {String} message
   * @param  {...Mixed} options
   */
  verbose (message, ...options) {
    this.driver().verbose(message, ...options)
  }

  /**
   * Log an 'info' level message.
   *
   * @param {String} message
   * @param  {...Mixed} options
   */
  info (message, ...options) {
    this.driver().info(message, ...options)
  }

  /**
   * Log a 'warn' level message.
   *
   * @param {String} message
   * @param  {...Mixed} options
   */
  warn (message, ...options) {
    this.driver().warn(message, ...options)
  }

  /**
   * Log an 'error' level message.
   *
   * @param {String} message
   * @param  {...Mixed} options
   */
  error (message, ...options) {
    this.driver().error(message, ...options)
  }
}

module.exports = new LoggingManager()
