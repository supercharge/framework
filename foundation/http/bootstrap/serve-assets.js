'use strict'

const Path = require('path')
const Helper = require('../../../helper')

class LoadRoutes {
  constructor () {
    this._assetsFolder = 'public'
  }

  async extends (server) {
    await this.serveAssets(server)
  }

  async serveAssets (server) {
    server.route([
      {
        method: 'GET',
        path: '/js/{path*}',
        handler: { directory: { path: this.resolveAsset('js') } }
      },
      {
        method: 'GET',
        path: '/css/{path*}',
        handler: { directory: { path: this.resolveAsset('css') } }
      },
      {
        method: 'GET',
        path: '/images/{path*}',
        handler: { directory: { path: this.resolveAsset('images') } }
      },
      {
        method: 'GET',
        path: '/favicon.ico',
        handler: { file: { path: this.resolveAsset('favicon.ico') } }
      }
    ])
  }

  resolveAsset (file) {
    return Path.resolve(this.assetsFolder(), file)
  }

  assetsFolder () {
    return Path.resolve(Helper.appRoot(), this._assetsFolder)
  }
}

module.exports = LoadRoutes
