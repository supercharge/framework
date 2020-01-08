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
    return Config.get('logging.driver') || 'console'
  }

  /**
   * Create a new logging driver if not existent.
   *
   * @param {String} name
   */
  ensureLogger (name = this._defaultDriver()) {
    this.driver(name)
  }

  /**
   * Returns a logging driver for the given `name`.
   *
   * @param {String} name
   *
   * @returns {Object}
   */
  driver (name = this._defaultDriver()) {
    if (!this._hasDriver(name)) {
      this._createDriver(name)
    }

    return this.drivers.get(name)
  }

  /**
   * Determines whether a logging driver is available for the given `name`.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  _hasDriver (name) {
    return this.drivers.has(name)
  }

  /**
   * Creates a new logging driver identified by `name`.
   *
   * @param {String} name
   */
  _createDriver (name) {
    this.drivers.set(name, this._createLogger(name))
  }

  /**
   * Creates a new logging transport for a driver identified by `name`.
   *
   * @param {String} name
   */
  _createLogger (name) {
    const logger = Winston.createLogger({
      format: Winston.format.combine(
        this.handleErrorLogs()
      )
    })

    this
      .getTransports(name)
      .forEach(transport => {
        logger.add(transport)
      })

    return logger
  }

  /**
   * Returns the logging transporter (file, console, stacked, etc.).
   *
   * @param {String} name
   *
   * @returns {Array}
   */
  getTransports (name) {
    const Transport = Transports[name]

    if (!Transport) {
      throw new Error(`The logging driver ${name} is not available.`)
    }

    return [].concat(
      new Transport().createTransporter()
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
