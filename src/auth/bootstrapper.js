'use strict'

const Path = require('path')
const Fs = require('../filesystem')
const Config = require('../config')
const Helper = require('../helper')
const ReadRecursive = require('recursive-readdir')

class AuthBoostrapper {
  constructor (app) {
    this._app = app
    this._schemeFiles = null
    this._strategyFiles = null
    this._config = Config.get('auth')
    this._schemesFolder = 'app/auth/schemes'
    this._strategiesFolder = 'app/auth/strategies'
  }

  async boot () {
    await this.loadAuthSchemes()
    await this.loadAuthStrategies()
    await this.setDefaultAuthStrategy()
  }

  async loadAuthSchemes () {
    if (await this.hasSchemes()) {
      return this.loadSchemes()
    }
  }

  async loadAuthStrategies () {
    if (await this.hasStrategies()) {
      return this.loadStrategies()
    }
  }

  async setDefaultAuthStrategy () {
    if (!this.defaultStrategy()) {
      return
    }

    if (!await this.hasStrategies()) {
      return
    }

    this._app.getServer().auth.default(this.defaultStrategy())
  }

  defaultStrategy () {
    return this._config.default
  }

  async hasStrategies () {
    return await this.strategiesFolderExists()
      ? this.hasStrategyFiles()
      : false
  }

  async strategiesFolderExists () {
    return Fs.exists(this.strategiesFolder())
  }

  async hasStrategyFiles () {
    return Object.keys(await this.strategyFiles()).length > 0
  }

  async strategyFiles () {
    if (!this._strategyFiles) {
      this._strategyFiles = await ReadRecursive(this.strategiesFolder())
    }

    return this._strategyFiles
  }

  async loadStrategies () {
    const files = await this.strategyFiles()

    files.forEach(strategyFile => {
      const { name, scheme, options } = this.resolveStrategy(strategyFile)
      this._app.getServer().auth.strategy(name, scheme, options)
    })
  }

  async hasSchemes () {
    return await this.schemesFolderExists()
      ? this.hasSchemeFiles()
      : false
  }

  async schemesFolderExists () {
    return Fs.exists(this.schemesFolder())
  }

  async hasSchemeFiles () {
    return Object.keys(await this.schemeFiles()).length > 0
  }

  async schemeFiles () {
    if (!this._schemeFiles) {
      this._schemeFiles = await ReadRecursive(this.schemesFolder())
    }

    return this._schemeFiles
  }

  async loadSchemes () {
    const files = await this.schemeFiles()

    files.forEach(schemeFile => {
      const { name, scheme } = this.resolveScheme(schemeFile)
      this._app.getServer().auth.scheme(name, scheme)
    })
  }

  resolveScheme (file) {
    return require(Path.resolve(this.strategiesFolder(), file))
  }

  resolveStrategy (file) {
    return require(Path.resolve(this.strategiesFolder(), file))
  }

  schemesFolder () {
    return Path.resolve(Helper.appRoot(), this._schemesFolder)
  }

  strategiesFolder () {
    return Path.resolve(Helper.appRoot(), this._strategiesFolder)
  }
}

module.exports = AuthBoostrapper
