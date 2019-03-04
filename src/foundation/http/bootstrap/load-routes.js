'use strict'

const _ = require('lodash')
const Path = require('path')
const Fs = require('./../../../filesystem')
const Helper = require('./../../../helper')
const ReadRecursive = require('recursive-readdir')

class LoadRoutes {
  constructor (app) {
    this.app = app
    this.files = {}
    this._routesFolder = 'app/routes'
  }

  async extends (server) {
    if (await this.hasRoutes()) {
      return this.loadRoutes(server)
    }

    if (!this.app.isRunningTests()) {
      console.log(`No routes detected in ${this._routesFolder}`)
    }
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
    this.files = await this.routeFiles()
    return Object.keys(this.files).length > 0
  }

  async loadRoutes (server) {
    this.files.forEach(routeFile => {
      server.route(this.resolve(routeFile))
    })
  }

  routesFolder () {
    return Path.resolve(Helper.appRoot(), this._routesFolder)
  }

  async routeFiles () {
    return ReadRecursive(this.routesFolder(), [ this.ignore ])
  }

  resolve (file) {
    return require(Path.resolve(this.routesFolder(), file))
  }

  ignore (file) {
    return _.startsWith(Path.basename(file), '_')
  }
}

module.exports = LoadRoutes
