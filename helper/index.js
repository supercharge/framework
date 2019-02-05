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
   * Absolute path to the routes directory.
   *
   * @param {String}
   *
   * @returns {String}
   */
  routesPath (...path) {
    return Path.resolve(this.appRoot(), 'app', 'http', 'routes', ...path)
  }
}

module.exports = new Helper()
