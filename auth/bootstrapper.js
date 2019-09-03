'use strict'

const Path = require('path')
const Fs = require('../filesystem')
const Config = require('../config')
const Helper = require('../helper')
const ReadRecursive = require('recursive-readdir')
const Collect = require('@supercharge/collections')

class AuthBoostrapper {
  constructor ({ server }) {
    this._server = server
    this._schemeFiles = null
    this._strategyFiles = null
    this._config = Config.get('auth', {})
    this._schemesFolder = 'app/auth/schemes'
    this._strategiesFolder = 'app/auth/strategies'
  }

  /**
   * Bootstrap authentication by loading the schemes,
   * strategies and applying the default app's
   * authentication strategy.
   */
  async boot () {
    await this.loadAuthSchemes()
    await this.loadAuthStrategies()
    await this.setDefaultAuthStrategy()
  }

  /**
   * Load the authentication schemes.
   */
  async loadAuthSchemes () {
    await this.loadDefaultAuthSchemes()

    if (await this.hasSchemes()) {
      return this.loadSchemes()
    }
  }

  async loadDefaultAuthSchemes () {
    [
      require('./schemes/session')
    ].forEach(scheme => {
      this.loadScheme(scheme)
    })
  }

  /**
   * Load the authentication strategies.
   */
  async loadAuthStrategies () {
    if (await this.hasStrategies()) {
      return this.loadStrategies()
    }
  }

  /**
   * Set the default authentication strategy.
   */
  async setDefaultAuthStrategy () {
    if (!this.defaultStrategy()) {
      return
    }

    if (!await this.hasStrategies()) {
      return
    }

    this._server.auth.default(this.defaultStrategy())
  }

  /**
   * Returns the default authentication configuration.
   *
   * @returns {Object|String}
   */
  defaultStrategy () {
    return this._config.default
  }

  /**
   * Determines whether auth strategies exist.
   *
   * @returns {Boolean}
   */
  async hasStrategies () {
    return await this.strategiesFolderExists()
      ? this.hasStrategyFiles()
      : false
  }

  /**
   * Determines whether an "app/auth/strategies"
   * directory exists.
   *
   * @returns {Boolean}
   */
  async strategiesFolderExists () {
    return Fs.exists(this.strategiesFolder())
  }

  /**
   * Determines whether the application has
   * authentication strategy files.
   *
   * @returns {Boolean}
   */
  async hasStrategyFiles () {
    return Collect(
      await this.strategyFiles()
    ).isNotEmpty()
  }

  /**
   * Load the authentication strategy files.
   *
   * @returns {Array}
   */
  async strategyFiles () {
    if (!this._strategyFiles) {
      this._strategyFiles = await ReadRecursive(this.strategiesFolder())
    }

    return this._strategyFiles
  }

  /**
   * Register the authentication strategies into the HTTP server.
   */
  async loadStrategies () {
    await Collect(
      await this.strategyFiles()
    ).forEach(strategyFile => {
      return this.loadStrategy(this.resolve(strategyFile))
    })
  }

  /**
   * Register a single authentication strategy to the HTTP server.
   *
   * @param {*} strategy
   */
  async loadStrategy (strategy) {
    if (typeof strategy === 'object') {
      return this.loadStrategyFromObject(strategy)
    }

    return this.loadStrategyFromClass(strategy)
  }

  /**
   * Register an authentication strategy to the HTTP server
   * using an object.
   *
   * @param {Object} strategy
   */
  async loadStrategyFromObject (strategy) {
    const { name, scheme, options } = strategy

    return this._server.auth.strategy(name, scheme, options)
  }

  /**
   * Register an authentication strategy to the HTTP server
   * using a class.
   *
   * @param {Class} strategy
   */
  async loadStrategyFromClass (Strategy) {
    return this._server.auth.strategy(Strategy.name, Strategy.scheme, new Strategy())
  }

  /**
   * Determines whether auth schemes exist.
   *
   * @returns {Boolean}
   */
  async hasSchemes () {
    return await this.schemesFolderExists()
      ? this.hasSchemeFiles()
      : false
  }

  async schemesFolderExists () {
    return Fs.exists(this.schemesFolder())
  }

  /**
   * Determines whether the application has
   * authentication schemes files.
   *
   * @returns {Boolean}
   */
  async hasSchemeFiles () {
    return Collect(
      await this.schemeFiles()
    ).isNotEmpty()
  }

  /**
   * Load the authentication scheme files.
   *
   * @returns {Array}
   */
  async schemeFiles () {
    if (!this._schemeFiles) {
      this._schemeFiles = await ReadRecursive(this.schemesFolder())
    }

    return this._schemeFiles
  }

  /**
   * Register the authentication schemes
   * into the HTTP server.
   */
  async loadSchemes () {
    await Collect(
      await this.schemeFiles()
    ).forEach(schemeFile => {
      return this.loadScheme(this.resolve(schemeFile))
    })
  }

  /**
   * Register a single authentication scheme to the HTTP server.
   *
   * @param {*} strategy
   */
  async loadScheme (scheme) {
    if (typeof scheme === 'object') {
      return this.loadSchemeFromObject(scheme)
    }

    return this.loadSchemeFromClass(scheme)
  }

  /**
   * Register an authentication scheme to the HTTP server
   * using an object.
   *
   * @param {Object} scheme
   */
  async loadSchemeFromObject ({ name, scheme }) {
    return this._server.auth.scheme(name, scheme)
  }

  /**
   * Register an authentication scheme to the HTTP server
   * using a class.
   *
   * @param {Class} Scheme
   */
  async loadSchemeFromClass (Scheme) {
    this._server.auth.scheme(Scheme.name, (server, strategy) => {
      return new Scheme(server, strategy)
    })
  }

  /**
   * Requires the given `file`.
   *
   * @param {String} file
   *
   * @returns {*}
   */
  resolve (file) {
    return require(file)
  }

  /**
   * Returns an absolute path to the authentication
   * schemes directory.
   *
   * @returns {String}
   */
  schemesFolder () {
    return Path.resolve(Helper.appRoot(), this._schemesFolder)
  }

  /**
   * Returns an absolute path to the authentication
   * strategies directory.
   *
   * @returns {String}
   */
  strategiesFolder () {
    return Path.resolve(Helper.appRoot(), this._strategiesFolder)
  }
}

module.exports = AuthBoostrapper
