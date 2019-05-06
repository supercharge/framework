'use strict'

const _ = require('lodash')
const Path = require('path')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')
const Logger = require('../../../logging')
const ReadRecursive = require('recursive-readdir')

class RegistersRoutes {
  constructor () {
    this._routeFiles = null
    this._routesFolder = 'app/routes'
  }

  async _loadAppRoutes () {
    if (await this.hasRoutes()) {
      return this.loadRoutes()
    }

    if (this.app.isRunningTests()) {
      return
    }

    Logger.debug(`No routes detected in ${this._routesFolder}`)
  }

  async hasRoutes () {
    return await this.routeFolderExists()
      ? this.hasRouteFiles()
      : false
  }

  async routeFolderExists () {
    return Fs.exists(this.routesFolder())
  }

  async hasRouteFiles () {
    return Object.keys(await this.routeFiles()).length > 0
  }

  async loadRoutes (server) {
    const files = await this.routeFiles()

    files.forEach(routeFile => {
      this.server.route(this.resolveRoute(routeFile))
    })
  }

  routesFolder () {
    return Path.resolve(Helper.appRoot(), this._routesFolder)
  }

  async routeFiles () {
    if (!this._routeFiles) {
      this._routeFiles = await ReadRecursive(this.routesFolder(), [ this.shouldIgnore ])
    }

    return this._routeFiles
  }

  resolveRoute (file) {
    return require(Path.resolve(this.routesFolder(), file))
  }

  shouldIgnore (file) {
    return _.startsWith(Path.basename(file), '_')
  }
}

module.exports = RegistersRoutes
