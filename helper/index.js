'use strict'

const Path = require('path')

class Helper {
  constructor () {
    this._appRoot = null
  }

  /**
   * Set path to the application’s root directory.
   *
   * @param {String}
   */
  setAppRoot (appRoot) {
    this._appRoot = appRoot
  }

  /**
   * Absolute path to the application’s root directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  appRoot () {
    return this._appRoot
  }

  /**
   * Absolute path to the resources/views directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  viewsPath (...path) {
    return Path.resolve(this.appRoot(), 'resources', 'views', ...path)
  }

  /**
   * Absolute path to the storage directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  storagePath (...path) {
    return Path.resolve(this.appRoot(), 'storage', ...path)
  }

  /**
   * Absolute path to the resources directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  resourcePath (...path) {
    return Path.resolve(this.appRoot(), 'resources', ...path)
  }

  /**
   * Absolute path to the models directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  modelsPath (...path) {
    return Path.resolve(this.appRoot(), 'app', 'models', ...path)
  }

  /**
   * Absolute path to the authentication strategies directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  strategiesPath (...path) {
    return Path.resolve(this.appRoot(), 'app', 'auth', 'strategies', ...path)
  }

  /**
   * Absolute path to the middlware directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  middlewarePath (...path) {
    return Path.resolve(this.appRoot(), 'app', 'http', 'middleware', ...path)
  }

  /**
   * Absolute path to the middlware directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  middlewarePath (...path) {
    return Path.resolve(this.appRoot(), 'app', 'http', 'middleware', ...path)
  }

  /**
   * Absolute path to the events directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  eventsPath (...path) {
    return Path.resolve(this.appRoot(), 'app', 'events', ...path)
  }

  /**
   * Absolute path to the event listeners directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  listenersPath (...path) {
    return Path.resolve(this.appRoot(), 'app', 'listeners', ...path)
  }

  /**
   * Absolute path to the mails directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  mailsPath (...path) {
    return Path.resolve(this.appRoot(), 'app', 'mails', ...path)
  }
}

module.exports = new Helper()
