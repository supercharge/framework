'use strict'

const Path = require('path')
const Fs = require('../filesystem')
const Helper = require('../helper')
const Logger = require('../logging')
const Collect = require('@supercharge/collections')

class RoutingBoostrapper {
  constructor (app) {
    this.app = app

    this._routeFiles = null
    this._routesFolder = 'app/routes'
  }

  /**
   * Bootstrap authentication by loading the schemes,
   * strategies and applying the default app's
   * authentication strategy.
   */
  async boot () {
    await this.loadAndRegisterRoutes()
  }

  /**
   * Load the authentication schemes.
   */
  async loadAndRegisterRoutes () {
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

  routesFolder () {
    return Path.resolve(Helper.appRoot(), this._routesFolder)
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
      this.app.server.route(this.resolveRoute(routeFile))
    })
  }

  async routeFiles () {
    if (!this._routeFiles) {
      this._routeFiles = await Fs.allFiles(this.routesFolder(), {
        ignore: file => this.shouldIgnore(file)
      })
    }

    return this._routeFiles
  }

  shouldIgnore (file) {
    return Path.basename(file).startsWith('_')
  }

  resolveRoute (file) {
    return require(Path.resolve(this.routesFolder(), file))
  }
}

module.exports = RoutingBoostrapper
