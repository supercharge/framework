'use strict'

const Path = require('path')
const Fs = require('../../filesystem')
const Helper = require('../../helper')
const Logger = require('../../logging')
const ReadRecursive = require('recursive-readdir')
const Collect = require('@supercharge/collections')
const RegistersMiddleware = require('./05-registers-middleware')

class RegistersRoutes extends RegistersMiddleware {
  constructor () {
    super()

    this._routeFiles = null
    this._routesFolder = 'app/routes'
  }

  async _loadAndRegisterRoutes () {
    if (await this.hasRoutes()) {
      return this.loadRoutes()
    }

    if (this.app.isRunningTests()) {
      return
    }

    Logger.debug(`No route files detected in ${this._routesFolder}`)
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
    return Collect(
      await this.routeFiles()
    ).isNotEmpty()
  }

  async loadRoutes () {
    await Collect(
      await this.routeFiles()
    ).forEach(routeFile => {
      this.server.route(this.resolveRoute(routeFile))
    })
  }

  routesFolder () {
    return Path.resolve(Helper.appRoot(), this._routesFolder)
  }

  async routeFiles () {
    if (!this._routeFiles) {
      this._routeFiles = await ReadRecursive(this.routesFolder(), [this.shouldIgnore])
    }

    return this._routeFiles
  }

  resolveRoute (file) {
    return require(Path.resolve(this.routesFolder(), file))
  }

  shouldIgnore (file) {
    return Path.basename(file).startsWith('_')
  }
}

module.exports = RegistersRoutes
