'use strict'

const Path = require('path')
const Fs = require('./../../../filesystem')
const Helper = require('./../../../helper')
const ReadRecursive = require('recursive-readdir')

class LoadAuthStrategies {
  constructor (app) {
    this.app = app
    this._strategiesFolder = 'app/auth/strategies'
  }

  async extends (server) {
    if (await this.hasStrategies()) {
      return this.loadStrategies(server)
    }
  }

  async hasStrategies () {
    return await this.strategiesFolderExists()
      ? this.hasStrategyFiles()
      : false
  }

  async strategiesFolderExists () {
    return Fs.exists(this.strategiesFolder())
  }

  strategiesFolder () {
    return Path.resolve(Helper.appRoot(), this._strategiesFolder)
  }

  async hasStrategyFiles () {
    return Object.keys(await this.strategyFiles()).length > 0
  }

  async strategyFiles () {
    return ReadRecursive(this.strategiesFolder())
  }

  async loadStrategies (server) {
    const files = await this.strategyFiles()

    files.forEach(strategyFile => {
      const { name, scheme, options } = this.resolve(strategyFile)
      server.auth.strategy(name, scheme, options)
    })
  }

  resolve (file) {
    return require(Path.resolve(this.strategiesFolder(), file))
  }
}

module.exports = LoadAuthStrategies
