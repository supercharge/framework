'use strict'

const _ = require('lodash')
const Path = require('path')
const Fs = require('../../../../filesystem')
const Helper = require('../../../../helper')
const Logger = require('../../../../logging')
const ReadRecursive = require('recursive-readdir')

class LoadRoutes {
  constructor (app) {
    this.app = app
    this.files = null
    this._routesFolder = 'app/routes'
  }

  async extends (server) {
    if (await this.hasRoutes()) {
      return this.loadRoutes(server)
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
      server.route(this.resolve(routeFile))
    })
  }

  routesFolder () {
    return Path.resolve(Helper.appRoot(), this._routesFolder)
  }

  async routeFiles () {
    if (!this.files) {
      this.files = await ReadRecursive(this.routesFolder(), [ this.ignore ])
    }
    return this.files
  }

  resolve (file) {
    return require(Path.resolve(this.routesFolder(), file))
  }

  ignore (file) {
    return _.startsWith(Path.basename(file), '_')
  }
}

module.exports = LoadRoutes
